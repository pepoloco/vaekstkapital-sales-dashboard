import { NextRequest, NextResponse } from "next/server"
import { fetchAll, hsGet } from "@/lib/hubspot/client"
import { classifyMeeting } from "@/lib/hubspot/metrics"

function parseMs(val: string | undefined | null): number {
  if (!val) return 0
  const n = Number(val)
  if (n > 1e12) return n
  const d = Date.parse(val)
  return d > 0 ? d : 0
}

function classifyOutcome(raw: string): string {
  const v = raw.toUpperCase().trim().replace(/[\s-]+/g, "_")
  if (v === "COMPLETED")                                       return "completed"
  if (v === "NO_SHOW")                                         return "noShow"
  if (v === "CANCELED" || v === "CANCELLED")                   return "cancelled"
  if (v === "RESCHEDULED")                                     return "rescheduled"
  if (v.startsWith("EXPECTED_INVESTMENT") && v.includes("3"))  return "expectedWithin3"
  if (v.startsWith("EXPECTED_INVESTMENT"))                     return "expectedWithin6"
  if (v.startsWith("THE_CUSTOMER_HAS_NO"))                     return "noInterest"
  if (v === "DISQUALIFIED_MEETING")                            return "disqualifiedMeeting"
  return "scheduled"
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const from    = searchParams.get("from")   // YYYY-MM-DD
    const to      = searchParams.get("to")     // YYYY-MM-DD
    const ownerId = searchParams.get("ownerId") // optional owner id for Created By filter

    const fromMs = from ? new Date(from).getTime() : Date.now() - 365 * 86400000
    const toMs   = to   ? new Date(to).getTime() + 86400000 - 1 : Date.now()

    // Owners for userId ↔ name mapping
    const ownersData = await hsGet("/crm/v3/owners?limit=100")
    const owners: any[] = ownersData.results ?? []
    const nameByUserId: Record<string, string>  = {}
    const userIdByOwnerId: Record<string, string> = {}
    for (const o of owners) {
      const uid = String(o.userId ?? "")
      const oid = String(o.id ?? "")
      if (uid) nameByUserId[uid] = `${o.firstName || ""} ${o.lastName || ""}`.trim()
      if (uid && oid) userIdByOwnerId[oid] = uid
    }

    // Resolve ownerId → userId filter
    const filterUserId = ownerId ? (userIdByOwnerId[ownerId] ?? null) : null

    // Fetch meetings in date range
    const meetings: any[] = await fetchAll("/crm/v3/objects/meetings/search", {
      filterGroups: [{ filters: [
        { propertyName: "hs_createdate", operator: "GTE", value: fromMs.toString() },
        { propertyName: "hs_createdate", operator: "LTE", value: toMs.toString() },
      ]}],
      properties: [
        "hs_meeting_title",
        "hs_meeting_start_time",
        "hs_createdate",
        "hs_internal_meeting_notes",
        "hs_activity_type",
        "hs_meeting_outcome",
        "hs_created_by_user_id",
      ],
      limit: 200,
    })

    // Group by creator userId
    type Row = {
      userId: string; name: string; total: number
      physical: number; teams: number; dinner: number; webinar: number
      scheduled: number; completed: number; rescheduled: number; noShow: number
      cancelled: number; expectedWithin3: number; expectedWithin6: number
      noInterest: number; disqualifiedMeeting: number
    }
    const byUser: Record<string, Row> = {}

    for (const m of meetings) {
      const uid = String(m.properties?.hs_created_by_user_id ?? "").trim()
      if (!uid || uid === "0") continue
      if (filterUserId && uid !== filterUserId) continue
      if (!byUser[uid]) byUser[uid] = {
        userId: uid, name: nameByUserId[uid] ?? "Ukendt", total: 0,
        physical: 0, teams: 0, dinner: 0, webinar: 0,
        scheduled: 0, completed: 0, rescheduled: 0, noShow: 0,
        cancelled: 0, expectedWithin3: 0, expectedWithin6: 0,
        noInterest: 0, disqualifiedMeeting: 0,
      }
      const row = byUser[uid]
      row.total++
      const type = classifyMeeting(
        m.properties?.hs_meeting_title          || "",
        m.properties?.hs_internal_meeting_notes || "",
        m.properties?.hs_activity_type          || "",
      )
      row[type]++
      const ok = classifyOutcome(m.properties?.hs_meeting_outcome || "") as keyof Row
      if (typeof row[ok] === "number") (row[ok] as number)++
    }

    const results = Object.values(byUser)
      .filter(r => r.name !== "Ukendt")
      .sort((a, b) => b.total - a.total)

    return NextResponse.json({ results, total: meetings.length })
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message) }, { status: 500 })
  }
}
