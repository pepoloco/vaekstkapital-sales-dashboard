import { NextResponse } from "next/server"
import { revalidateTag } from "next/cache"
import { getCachedDashboardData } from "@/lib/hubspot/cache"

export const maxDuration = 300

export async function GET() {
  try {
    revalidateTag("dashboard-data")
    const data = await getCachedDashboardData()
    return NextResponse.json({ ok: true, lastUpdated: data.lastUpdated })
  } catch (err: any) {
    console.error("[Sync]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
