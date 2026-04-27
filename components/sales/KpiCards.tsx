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
    { label: "Total Revenue",     sub: "12 weeks",        value: `€${totalRevenue.toLocaleString("da-DK")}`, color: "#4ade80" },
    { label: "Deals Closed",      sub: "12 weeks",        value: totalDeals,                                  color: "#60a5fa" },
    { label: "Avg Hit Rate",      sub: "all consultants", value: `${(avgHitRate * 100).toFixed(1)}%`,         color: "#a78bfa" },
    { label: "Trending Up",       sub: "4w vs prior 8w",  value: `${trending} / ${n}`,                       color: "#fb923c" },
    { label: "Avg Meeting Index", sub: "team average",    value: avgMeetIdx,                                  color: "#f472b6" },
    { label: "Avg Sales Index",   sub: "team average",    value: avgSalesIdx,                                 color: "#34d399" },
  ]

  return (
    <div className="kpi-grid">
      {cards.map(c => (
        <div key={c.label} className="kpi-card" style={{ "--accent": c.color } as React.CSSProperties}>
          <div className="kpi-value">{c.value}</div>
          <div className="kpi-label">{c.label}</div>
          <div className="kpi-sub">{c.sub}</div>
        </div>
      ))}
    </div>
  )
}
