import { hsGet, fetchAll } from "./client"
import { calcMeetingIndex, calcSalesIndex, classifyMeeting } from "./metrics"
import { Consultant, DashboardData, MeetingOutcomes, WeeklyResult } from "@/types/sales"

// Exact-match team names (case-insensitive). "bu dk" alone is too broad.
const TEAM_PATTERNS = [
  "team denmark",
  "bu dk - telemarketing tm",
  "bu dk - telemarketing",
  "telemarketing tm",
]

function matchesTeam(teamName: string): boolean {
  const n = teamName.toLowerCase().trim()
  return TEAM_PATTERNS.some(p => n === p || n.includes(p))
}

// Returns relative week 1–12 using day arithmetic — no ISO-week year-boundary issues
function relWeek(ts: number, windowStart: number): number {
  const days = (ts - windowStart) / 86400000
  return Math.max(1, Math.min(12, Math.floor(days / 7) + 1))
}

function classifyOutcome(raw: string): keyof MeetingOutcomes {
  const v = raw.toUpperCase().trim()
  if (v === "COMPLETED")                              return "completed"
  if (v === "NO_SHOW")                                return "noShow"
  if (v === "CANCELED" || v === "CANCELLED")          return "cancelled"
  if (v === "RESCHEDULED")                            return "rescheduled"
  if (v.startsWith("EXPECTED_INVESTMENT"))            return "qualified"
  if (v.startsWith("THE_CUSTOMER_HAS_NO") ||
      v === "DISQUALIFIED_MEETING")                   return "disqualified"
  return "scheduled"   // SCHEDULED or blank
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const now      = new Date()
  const w12Start = new Date(now.getTime() - 84 * 86400000)
  const l4wStart = new Date(now.getTime() - 28 * 86400000)
  const p8wStart = new Date(now.getTime() - 84 * 86400000)
  const p8wEnd   = new Date(now.getTime() - 28 * 86400000)
  const win      = w12Start.getTime()

  // 1. Owners
  const ownersData = await hsGet("/crm/v3/owners?limit=100")
  const allOwners: any[] = ownersData.results ?? []

  // Filter to configured teams — fall back to all owners if no team data found
  const teamOwners = allOwners.filter((o: any) =>
    o.teams?.some((t: any) => matchesTeam(t.name || ""))
  )
  const teamIds       = new Set(teamOwners.map((o: any) => String(o.id)))
  const useTeamFilter = teamIds.size > 0

  // 2. Closed-won deals last 12 weeks
  const deals12w = await fetchAll("/crm/v3/objects/deals/search", {
    filterGroups: [{ filters: [
      { propertyName: "hs_is_closed_won", operator: "EQ",  value: "true" },
      { propertyName: "closedate",        operator: "GTE", value: win.toString() },
    ]}],
    properties: ["amount", "closedate", "createdate", "hubspot_owner_id"],
    limit: 200,
  })

  // 3. Prior 8w deals
  const dealsPrior = await fetchAll("/crm/v3/objects/deals/search", {
    filterGroups: [{ filters: [
      { propertyName: "hs_is_closed_won", operator: "EQ",  value: "true" },
      { propertyName: "closedate",        operator: "GTE", value: p8wStart.getTime().toString() },
      { propertyName: "closedate",        operator: "LT",  value: p8wEnd.getTime().toString() },
    ]}],
    properties: ["amount", "closedate", "hubspot_owner_id"],
    limit: 200,
  })

  // 4. Relevant owners — in team AND had deals OR meetings (we'll discover meetings below)
  //    Start with team members; if no team filter, fall back to owners with deals
  let candidateOwners: any[]
  if (useTeamFilter) {
    candidateOwners = allOwners.filter((o: any) => o.firstName && teamIds.has(String(o.id)))
  } else {
    const activeIds = [...new Set(
      deals12w.map((d: any) => d.properties.hubspot_owner_id).filter(Boolean)
    )] as string[]
    candidateOwners = allOwners.filter((o: any) => activeIds.includes(String(o.id)) && o.firstName)
  }

  // 5. Contacts — batched 3 owners per request (HubSpot filterGroups hard limit)
  let contacts: any[] = []
  if (candidateOwners.length > 0) {
    const ids     = candidateOwners.map((o: any) => String(o.id))
    const chunks: string[][] = []
    for (let i = 0; i < ids.length; i += 3) chunks.push(ids.slice(i, i + 3))
    const settled = await Promise.allSettled(
      chunks.map(chunk =>
        fetchAll("/crm/v3/objects/contacts/search", {
          filterGroups: chunk.map(id => ({ filters: [{ propertyName: "hubspot_owner_id", operator: "EQ", value: id }] })),
          properties: ["hubspot_owner_id", "createdate"],
          limit: 200,
        })
      )
    )
    contacts = settled.flatMap(r => r.status === "fulfilled" ? r.value : [])
  }

  // 6. Build per-consultant data
  const rawList = await Promise.all(candidateOwners.map(async (owner: any) => {
    const oid = String(owner.id)

    // Meetings — includes type and outcome properties
    let meetings: any[] = []
    try {
      meetings = await fetchAll("/crm/v3/objects/meetings/search", {
        filterGroups: [{ filters: [
          { propertyName: "hubspot_owner_id",      operator: "EQ",  value: oid },
          { propertyName: "hs_meeting_start_time", operator: "GTE", value: win.toString() },
        ]}],
        properties: [
          "hs_meeting_title",
          "hs_meeting_start_time",
          "hs_internal_meeting_notes",
          "hs_meeting_type",
          "hs_meeting_outcome",
        ],
        limit: 200,
      })
    } catch { /* meetings scope may not be enabled */ }

    // Weekly buckets W1–W12
    const wMap: Record<number, WeeklyResult> = {}
    for (let w = 1; w <= 12; w++) {
      wMap[w] = { week: w, physical: 0, teams: 0, dinner: 0, webinar: 0, amount: 0, count: 0 }
    }

    const outcomes: MeetingOutcomes = {
      scheduled: 0, completed: 0, rescheduled: 0,
      noShow: 0, cancelled: 0, qualified: 0, disqualified: 0,
    }

    meetings.forEach((m: any) => {
      const t = m.properties?.hs_meeting_start_time
      if (t) {
        const ts   = parseInt(t)
        const wIdx = relWeek(ts, win)
        const type = classifyMeeting(
          m.properties?.hs_meeting_title          || "",
          m.properties?.hs_internal_meeting_notes || "",
          m.properties?.hs_meeting_type           || "",
        )
        wMap[wIdx][type]++
      }
      // Outcome counts for all meetings in the window
      outcomes[classifyOutcome(m.properties?.hs_meeting_outcome || "")]++
    })

    const ownerDeals = deals12w.filter((d: any) => d.properties.hubspot_owner_id === oid)
    const priorDeals = dealsPrior.filter((d: any) => d.properties.hubspot_owner_id === oid)

    let totalAmount = 0
    let totalDuration = 0
    ownerDeals.forEach((d: any) => {
      const amt     = parseFloat(d.properties.amount || "0")
      totalAmount  += amt
      const created = new Date(d.properties.createdate)
      const closed  = new Date(d.properties.closedate)
      totalDuration += (closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 30)
      wMap[relWeek(closed.getTime(), win)].amount += amt
      wMap[relWeek(closed.getTime(), win)].count++
    })

    const totalCount    = ownerDeals.length
    const weeklyResults = Object.values(wMap)

    // Effort = last 4 weeks (W9–W12)
    const effort = weeklyResults.filter(w => w.week >= 9).reduce(
      (acc, w) => ({
        physical: acc.physical + w.physical,
        teams:    acc.teams    + w.teams,
        dinner:   acc.dinner   + w.dinner,
        webinar:  acc.webinar  + w.webinar,
      }),
      { physical: 0, teams: 0, dinner: 0, webinar: 0 }
    )

    const fourWeeksAgo  = new Date(now.getTime() - 28 * 86400000)
    const eightWeeksAgo = new Date(now.getTime() - 56 * 86400000)
    const ownerContacts = contacts.filter((c: any) => c.properties?.hubspot_owner_id === oid)
    const recentLeads   = ownerContacts.filter((c: any) => new Date(c.properties.createdate) >= fourWeeksAgo).length
    const priorLeads    = ownerContacts.filter((c: any) => {
      const d = new Date(c.properties.createdate)
      return d >= eightWeeksAgo && d < fourWeeksAgo
    }).length

    const l4wDeals = ownerDeals.filter((d: any) => new Date(d.properties.closedate) >= l4wStart).length
    const trendPos = l4wDeals > (priorDeals.length / 2)

    return {
      id: oid,
      name: `${owner.firstName} ${owner.lastName}`.trim(),
      _amount:   Math.round(totalAmount),
      _meetings: meetings.length,
      trendPositive: trendPos,
      weeklyResults,
      totalAmount:   Math.round(totalAmount),
      totalCount,
      avgTicketSize: totalCount > 0 ? Math.round(totalAmount / totalCount) : 0,
      effort,
      outcomes,
      convDurationAvg: totalCount > 0 ? parseFloat((totalDuration / totalCount).toFixed(1)) : 0,
      hitRate:         ownerContacts.length > 0 ? totalCount / ownerContacts.length : 0,
      leadsDifference: recentLeads - priorLeads,
      numberOfLeads:   ownerContacts.length,
    }
  }))

  // 7. Team averages for indices
  const amounts    = rawList.map(c => c._amount).filter(a => a > 0)
  const meetCounts = rawList.map(c => c._meetings)
  const teamAvgAmt  = amounts.length    ? amounts.reduce((a, b) => a + b, 0)    / amounts.length    : 1
  const teamAvgMeet = meetCounts.length ? meetCounts.reduce((a, b) => a + b, 0) / meetCounts.length : 1

  const consultants: Consultant[] = rawList
    // Include anyone with meetings OR deals — telemarketers may have 0 deals
    .filter(c => c._meetings > 0 || c.totalCount > 0)
    .sort((a, b) => b._meetings - a._meetings || b._amount - a._amount)
    .map(({ _amount, _meetings, ...c }) => ({
      ...c,
      meetingIndex: calcMeetingIndex(c.weeklyResults, teamAvgMeet),
      salesIndex:   calcSalesIndex(_amount, teamAvgAmt),
      hitRate:      parseFloat(c.hitRate.toFixed(4)),
    }))

  return {
    consultants,
    lastUpdated: new Date().toISOString(),
    periodStart: w12Start.toISOString(),
    periodEnd:   now.toISOString(),
  }
}
