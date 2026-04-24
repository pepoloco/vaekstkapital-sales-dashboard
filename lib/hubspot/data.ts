import { hsGet, hsPost, fetchAll } from "./client"
import { calcMeetingIndex, calcSalesIndex, calcTrend, getWeekNumber } from "./metrics"
import { Consultant, DashboardData, WeeklyResult } from "@/types/sales"

const now = new Date()
const days = (n: number) => new Date(now.getTime() - n * 86_400_000)

const W12_START = days(84)
const L4W_START = days(28)
const P8W_START = days(84)
const P8W_END   = days(28)

export async function fetchDashboardData(): Promise<DashboardData> {
  // 1. Owners
  const ownersData = await hsGet("/crm/v3/owners?limit=100")
  const allOwners: any[] = ownersData.results ?? []

  // 2. Closed-won deals last 12 weeks
  const deals12w = await fetchAll("/crm/v3/objects/deals/search", {
    filterGroups: [{ filters: [
      { propertyName: "hs_is_closed_won", operator: "EQ",  value: "true" },
      { propertyName: "closedate",        operator: "GTE", value: W12_START.getTime().toString() },
    ]}],
    properties: ["amount", "closedate", "createdate", "hubspot_owner_id"],
    limit: 200,
  })

  // 3. Prior 8w deals for trend comparison
  const dealsPrior = await fetchAll("/crm/v3/objects/deals/search", {
    filterGroups: [{ filters: [
      { propertyName: "hs_is_closed_won", operator: "EQ",  value: "true" },
      { propertyName: "closedate",        operator: "GTE", value: P8W_START.getTime().toString() },
      { propertyName: "closedate",        operator: "LT",  value: P8W_END.getTime().toString() },
    ]}],
    properties: ["amount", "closedate", "hubspot_owner_id"],
    limit: 200,
  })

  // 4. Active owner IDs
  const activeIds = [...new Set(
    deals12w.map((d: any) => d.properties.hubspot_owner_id).filter(Boolean)
  )] as string[]

  const activeOwners = allOwners.filter(
    (o: any) => activeIds.includes(String(o.id)) && o.firstName
  )

  // 5. Contacts (leads) for active owners
  const contacts = activeIds.length > 0
    ? await fetchAll("/crm/v3/objects/contacts/search", {
        filterGroups: [{ filters: [{
          propertyName: "hubspot_owner_id",
          operator: "IN",
          values: activeIds,
        }]}],
        properties: ["hubspot_owner_id", "createdate"],
        limit: 200,
      })
    : []

  // 6. Meetings for each owner
  const startWeek = getWeekNumber(W12_START)

  const rawConsultants = await Promise.all(activeOwners.map(async (owner: any) => {
    const oid = String(owner.id)

    // Fetch meetings for this owner
    let meetings: any[] = []
    try {
      const mData = await fetchAll("/crm/v3/objects/meetings/search", {
        filterGroups: [{ filters: [
          { propertyName: "hubspot_owner_id",      operator: "EQ",  value: oid },
          { propertyName: "hs_meeting_start_time", operator: "GTE", value: W12_START.getTime().toString() },
        ]}],
        properties: ["hs_meeting_title", "hs_meeting_start_time", "hs_internal_meeting_notes", "hubspot_owner_id"],
        limit: 200,
      })
      meetings = mData
    } catch { /* meetings API may not be enabled */ }

    // Build W1–W12 buckets
    const weeklyMap: Record<number, WeeklyResult> = {}
    for (let w = 1; w <= 12; w++) {
      weeklyMap[w] = { week: w, physical: 0, teams: 0, dinner: 0, webinar: 0, amount: 0, count: 0 }
    }

    // Distribute meetings
    meetings.forEach((m: any) => {
      const t = m.properties?.hs_meeting_start_time
      if (!t) return
      const absWeek = getWeekNumber(new Date(parseInt(t)))
      const relWeek = Math.max(1, Math.min(12, absWeek - startWeek + 1))
      const type = classifyMeeting(m.properties?.hs_meeting_title || "", m.properties?.hs_internal_meeting_notes || "")
      if (weeklyMap[relWeek]) weeklyMap[relWeek][type]++
    })

    // Distribute deals
    const ownerDeals = deals12w.filter((d: any) => d.properties.hubspot_owner_id === oid)
    const priorDeals = dealsPrior.filter((d: any) => d.properties.hubspot_owner_id === oid)

    let totalAmount = 0, totalDuration = 0
    ownerDeals.forEach((d: any) => {
      const amount = parseFloat(d.properties.amount || "0")
      totalAmount += amount
      const created = new Date(d.properties.createdate)
      const closed  = new Date(d.properties.closedate)
      totalDuration += (closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 30)
      const absWeek = getWeekNumber(closed)
      const relWeek = Math.max(1, Math.min(12, absWeek - startWeek + 1))
      if (weeklyMap[relWeek]) { weeklyMap[relWeek].amount += amount; weeklyMap[relWeek].count++ }
    })

    const totalCount   = ownerDeals.length
    const weeklyResults = Object.values(weeklyMap)

    // Effort = weeks 9–12
    const effort = weeklyResults.filter(w => w.week >= 9).reduce(
      (acc, w) => ({ physical: acc.physical + w.physical, teams: acc.teams + w.teams, dinner: acc.dinner + w.dinner, webinar: acc.webinar + w.webinar }),
      { physical: 0, teams: 0, dinner: 0, webinar: 0 }
    )

    // Leads
    const fourWeeksAgo  = days(28)
    const eightWeeksAgo = days(56)
    const ownerContacts = contacts.filter((c: any) => c.properties?.hubspot_owner_id === oid)
    const recentLeads   = ownerContacts.filter((c: any) => new Date(c.properties.createdate) >= fourWeeksAgo).length
    const priorLeads    = ownerContacts.filter((c: any) => { const d = new Date(c.properties.createdate); return d >= eightWeeksAgo && d < fourWeeksAgo }).length

    // Trend: last 4w deals vs prior 8w (normalised)
    const l4wDeals    = ownerDeals.filter((d: any) => new Date(d.properties.closedate) >= L4W_START).length
    const prior8wRate = priorDeals.length / 2
    const trendPositive = l4wDeals > prior8wRate

    return {
      id: oid,
      name: `${owner.firstName} ${owner.lastName}`.trim(),
      _totalAmount: Math.round(totalAmount),
      _totalMeetings: meetings.length,
      trendPositive,
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

  // 7. Compute team averages for indices
  const amounts  = rawConsultants.map(c => c._totalAmount).filter(a => a > 0)
  const meetings = rawConsultants.map(c => c._totalMeetings)
  const teamAvgAmount   = amounts.length  ? amounts.reduce((a, b) => a + b, 0)  / amounts.length  : 1
  const teamAvgMeetings = meetings.length ? meetings.reduce((a, b) => a + b, 0) / meetings.length : 1

  const consultants: Consultant[] = rawConsultants
    .filter(c => c.totalCount > 0)
    .map(({ _totalAmount, _totalMeetings, ...c }) => ({
      ...c,
      meetingIndex: calcMeetingIndex(c.weeklyResults, teamAvgMeetings),
      salesIndex:   calcSalesIndex(_totalAmount, teamAvgAmount),
      hitRate: parseFloat(c.hitRate.toFixed(4)),
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount)

  return {
    consultants,
    lastUpdated:  new Date().toISOString(),
    periodStart:  W12_START.toISOString(),
    periodEnd:    now.toISOString(),
  }
}

function classifyMeeting(title: string, notes: string): "physical" | "teams" | "dinner" | "webinar" {
  const t = (title + " " + notes).toLowerCase()
  if (t.includes("dinner") || t.includes("lunch"))                                        return "dinner"
  if (t.includes("webinar") || t.includes("seminar"))                                     return "webinar"
  if (t.includes("teams") || t.includes("zoom") || t.includes("video") || t.includes("online")) return "teams"
  return "physical"
}
