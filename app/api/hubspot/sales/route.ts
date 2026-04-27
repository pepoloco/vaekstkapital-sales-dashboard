import { NextResponse } from "next/server"
import { fetchDashboardData } from "@/lib/hubspot/data"

export const revalidate = 3600
export const maxDuration = 60

export async function GET() {
  try {
    const data = await fetchDashboardData()
    return NextResponse.json(data)
  } catch (err: any) {
    console.error("[Sales API]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
