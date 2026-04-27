"use client"
import { useState, useEffect } from "react"
import KpiCards from "./KpiCards"
import SalesTable from "./SalesTable"
import { DashboardData } from "@/types/sales"

export default function SalesDashboardClient() {
  const [data, setData]     = useState<DashboardData | null>(null)
  const [error, setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/hubspot/sales")
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setData(d)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="loading-wrap">
      <div className="spinner" />
      <p className="loading-txt">Henter data fra HubSpot…</p>
    </div>
  )

  if (error) return <div className="err">⚠ HubSpot fejl: {error}</div>
  if (!data) return null

  const period = data.periodStart
    ? `${new Date(data.periodStart).toLocaleDateString("da-DK", { day: "numeric", month: "short" })} – ${new Date(data.periodEnd).toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" })}`
    : "Seneste 12 uger"

  const upd    = new Date(data.lastUpdated)
  const updStr = `${upd.toLocaleDateString("da-DK", { day: "numeric", month: "numeric", year: "numeric" })}, ${upd.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`

  return (
    <>
      <p className="sub-meta">{period} · Opdateret {updStr}</p>
      <div className="sec"><KpiCards consultants={data.consultants} /></div>
      <div className="sec"><SalesTable consultants={data.consultants} /></div>
    </>
  )
}
