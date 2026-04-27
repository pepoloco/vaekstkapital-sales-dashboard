"use client"
import { Consultant } from "@/types/sales"

export default function KpiCards({ consultants }: { consultants: Consultant[] }) {
  const n = consultants.length

  const totalMeetings = consultants.reduce((s, c) =>
    s + c.outcomes.completed + c.outcomes.noShow + c.outcomes.cancelled + c.outcomes.scheduled, 0)
  const totalCompleted  = consultants.reduce((s, c) => s + c.outcomes.completed,  0)
  const totalNoShow     = consultants.reduce((s, c) => s + c.outcomes.noShow,     0)
  const totalCancelled  = consultants.reduce((s, c) => s + c.outcomes.cancelled,  0)
  const completionRate  = totalMeetings > 0 ? (totalCompleted / totalMeetings) * 100 : 0
  const noShowRate      = totalMeetings > 0 ? (totalNoShow    / totalMeetings) * 100 : 0

  const totalRevenue = consultants.reduce((s, c) => s + c.totalAmount, 0)
  const trending     = consultants.filter(c => c.trendPositive).length

  const cards = [
    { label: "Møder Booket",       sub: "12 uger total",        value: String(totalMeetings)                        },
    { label: "Gennemførte Møder",  sub: "12 uger",              value: `${totalCompleted} (${completionRate.toFixed(0)}%)` },
    { label: "No Show",            sub: "12 uger",              value: `${totalNoShow} (${noShowRate.toFixed(0)}%)` },
    { label: "Aflyst",             sub: "12 uger",              value: String(totalCancelled)                       },
    { label: "Total Omsætning",    sub: "12 uger",              value: `€${totalRevenue.toLocaleString("da-DK")}`   },
    { label: "Positiv Trend",      sub: "4 uger vs. 8 uger",   value: `${trending} / ${n}`                         },
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
