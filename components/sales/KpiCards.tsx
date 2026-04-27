"use client"
import { Consultant } from "@/types/sales"

export default function KpiCards({ consultants }: { consultants: Consultant[] }) {
  const n            = consultants.length
  const totalRevenue = consultants.reduce((s, c) => s + c.totalAmount, 0)
  const totalDeals   = consultants.reduce((s, c) => s + c.totalCount, 0)
  const avgHitRate   = n ? consultants.reduce((s, c) => s + c.hitRate, 0) / n : 0
  const trending     = consultants.filter(c => c.trendPositive).length
  const avgMeetIdx   = n ? Math.round(consultants.reduce((s, c) => s + c.meetingIndex, 0) / n) : 0
  const avgSalesIdx  = n ? Math.round(consultants.reduce((s, c) => s + c.salesIndex, 0)  / n) : 0

  const cards = [
    { label: "Total Omsætning",  sub: "12 uger",           value: `€${totalRevenue.toLocaleString("da-DK")}` },
    { label: "Lukkede Deals",    sub: "12 uger",           value: String(totalDeals) },
    { label: "Gns. Hit Rate",    sub: "alle konsulenter",  value: `${(avgHitRate * 100).toFixed(1)}%` },
    { label: "Positiv Trend",    sub: "4 uger vs. 8 uger", value: `${trending} / ${n}` },
    { label: "Gns. Møde Index",  sub: "team gennemsnit",   value: String(avgMeetIdx) },
    { label: "Gns. Salgs Index", sub: "team gennemsnit",   value: String(avgSalesIdx) },
  ]

  return (
    <div className="kpi-grid">
      {cards.map(c => (
        <div key={c.label} className="kpi-card">
          <div className="kpi-lbl">{c.label}</div>
          <div className="kpi-val">{c.value}</div>
          <div className="kpi-sub">{c.sub}</div>
        </div>
      ))}
    </div>
  )
}
