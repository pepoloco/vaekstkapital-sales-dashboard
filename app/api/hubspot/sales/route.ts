import { NextResponse } from "next/server"
import { getCachedDashboardData } from "@/lib/hubspot/cache"

export const maxDuration = 300

export async function GET() {
  try {
    const data = await getCachedDashboardData()
    return NextResponse.json(data)
  } catch (err: any) {
    console.error("[Sales API]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
