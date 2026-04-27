import { hsGet, fetchAll } from "./client"
import { calcMeetingIndex, calcSalesIndex, calcTrend, getWeekNumber, classifyMeeting } from "./metrics"
import { Consultant, DashboardData, WeeklyResult } from "@/types/sales"

export async function fetchDashboardData(): Promise<DashboardData> {
  const now       = new Date()
  const w12Start  = new Date(now.getTime() - 84 * 86400000)
  const l4wStart  = new Date(now.getTime() - 28 * 86400000)
  const p8wStart  = new Date(now.getTime() - 84 * 86400000)
  const p8wEnd    = new Date(now.getTime() - 28 * 86400000)
  const startWeek = getWeekNumber(w12Start)

  // 1. Owners
  const ownersData  = await hsGet("/crm/v3/owners?limit=100")
  const allOwners: any[] = ownersData.results ?? []

  // 2. Closed-won deals last 12 weeks
  const deals12w = await fetchAll("/crm/v3/objects/deals/search", {
    filterGroups: [{ filters: [
      { propertyName: "hs_is_closed_won", operator: "EQ",  value: "true" },
      { propertyName: "closedate",        operator: "GTE", value: w12Start.getTime().toString() },
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

  // 4. Active owners
  const activeIds = [...new Set(
    deals12w.map((d: any) => d.properties.hubspot_owner_id).filter(Boolean)
  )] as string[]

  const activeOwners = allOwners.filter(
    (o: any) => activeIds.includes(String(o.id)) && o.firstName
  )

  // 5. Contacts (requires crm.objects.contacts.read scope — degrade gracefully if missing)
  let contacts: any[] = []
  if (activeIds.length > 0) {
    try {
      contacts = await fetchAll("/crm/v3/objects/contacts/search", {
        filterGroups: activeIds.map(id => ({
          filters: [{ propertyName: "hubspot_owner_id", operator: "EQ", value: id }],
        })),
        properties: ["hubspot_owner_id", "createdate"],
        limit: 200,
      })
    } catch { /* contacts scope not enabled — hit rate and leads will show 0 */ }
  }

  // 6. Build per-consultant data
  const rawList = await Promise.all(activeOwners.map(async (owner: any) => {
    const oid = String(owner.id)

    // Meetings
    let meetings: any[] = []
    try {
      meetings = await fetchAll("/crm/v3/objects/meetings/search", {
        filterGroups: [{ filters: [
          { propertyName: "hubspot_owner_id",      operator: "EQ",  value: oid },
          { propertyName: "hs_meeting_start_time", operator: "GTE", value: w12Start.getTime().toString() },
        ]}],
        properties: ["hs_meeting_title", "hs_meeting_start_time", "hs_internal_meeting_notes"],
        limit: 200,
      })
    } catch { /* meetings scope may not be enabled */ }

    // Weekly buckets W1–W12
    const wMap: Record<number, WeeklyResult> = {}
    for (let w = 1; w <= 12; w++) {
      wMap[w] = { week: w, physical: 0, teams: 0, dinner: 0, webinar: 0, amount: 0, count: 0 }
    }

    meetings.forEach((m: any) => {
      const t = m.properties?.hs_meeting_start_time
      if (!t) return
      const rel = Math.max(1, Math.min(12, getWeekNumber(new Date(parseInt(t))) - startWeek + 1))
      const type = classifyMeeting(m.properties?.hs_meeting_title || "", m.properties?.hs_internal_meeting_notes || "")
      wMap[rel][type]++
    })

    const ownerDeals = deals12w.filter((d: any) => d.properties.hubspot_owner_id === oid)
    const priorDeals = dealsPrior.filter((d: any) => d.properties.hubspot_owner_id === oid)

    let totalAmount = 0
    let totalDuration = 0
    ownerDeals.forEach((d: any) => {
      const amt = parseFloat(d.properties.amount || "0")
      totalAmount += amt
      const created = new Date(d.properties.createdate)
      const closed  = new Date(d.properties.closedate)
      totalDuration += (closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 30)
      const rel = Math.max(1, Math.min(12, getWeekNumber(closed) - startWeek + 1))
      wMap[rel].amount += amt
      wMap[rel].count++
    })

    const totalCount    = ownerDeals.length
    const weeklyResults = Object.values(wMap)

    const effort = weeklyResults.filter(w => w.week >= 9).reduce(
      (acc, w) => ({ physical: acc.physical + w.physical, teams: acc.teams + w.teams, dinner: acc.dinner + w.dinner, webinar: acc.webinar + w.webinar }),
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

    const l4wDeals    = ownerDeals.filter((d: any) => new Date(d.properties.closedate) >= l4wStart).length
    const trendPos    = l4wDeals > (priorDeals.length / 2)

    return {
      id: oid,
      name: `${owner.firstName} ${owner.lastName}`.trim(),
      _amount: Math.round(totalAmount),
      _meetings: meetings.length,
      trendPositive: trendPos,
      weeklyResults,
      totalAmount: Math.round(totalAmount),
      totalCount,
      avgTicketSize: totalCount > 0 ? Math.round(totalAmount / totalCount) : 0,
      effort,
      convDurationAvg: totalCount > 0 ? parseFloat((totalDuration / totalCount).toFixed(1)) : 0,
      hitRate: ownerContacts.length > 0 ? totalCount / ownerContacts.length : 0,
      leadsDifference: recentLeads - priorLeads,
      numberOfLeads: ownerContacts.length,
    }
  }))

  // 7. Team averages for indices
  const amounts   = rawList.map(c => c._amount).filter(a => a > 0)
  const meetCounts = rawList.map(c => c._meetings)
  const teamAvgAmt  = amounts.length   ? amounts.reduce((a, b) => a + b, 0)   / amounts.length   : 1
  const teamAvgMeet = meetCounts.length ? meetCounts.reduce((a, b) => a + b, 0) / meetCounts.length : 1

  const consultants: Consultant[] = rawList
    .filter(c => c.totalCount > 0)
    .map(({ _amount, _meetings, ...c }) => ({
      ...c,
      meetingIndex: calcMeetingIndex(c.weeklyResults, teamAvgMeet),
      salesIndex:   calcSalesIndex(_amount, teamAvgAmt),
      hitRate:      parseFloat(c.hitRate.toFixed(4)),
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount)

  return {
    consultants,
    lastUpdated: new Date().toISOString(),
    periodStart: w12Start.toISOString(),
    periodEnd:   now.toISOString(),
  }
}
