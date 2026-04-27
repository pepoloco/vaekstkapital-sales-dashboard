"use client"
import { Consultant } from "@/types/sales"

function sum<K extends string>(consultants: Consultant[], key: K, getter: (c: Consultant) => number) {
  return consultants.reduce((s, c) => s + getter(c), 0)
}

export default function KpiCards({ consultants }: { consultants: Consultant[] }) {
  const o = {
    scheduled:           consultants.reduce((s, c) => s + c.outcomes.scheduled,           0),
    completed:           consultants.reduce((s, c) => s + c.outcomes.completed,           0),
    rescheduled:         consultants.reduce((s, c) => s + c.outcomes.rescheduled,         0),
    noShow:              consultants.reduce((s, c) => s + c.outcomes.noShow,              0),
    cancelled:           consultants.reduce((s, c) => s + c.outcomes.cancelled,           0),
    expectedWithin3:     consultants.reduce((s, c) => s + c.outcomes.expectedWithin3,     0),
    expectedWithin6:     consultants.reduce((s, c) => s + c.outcomes.expectedWithin6,     0),
    noInterest:          consultants.reduce((s, c) => s + c.outcomes.noInterest,          0),
    disqualifiedMeeting: consultants.reduce((s, c) => s + c.outcomes.disqualifiedMeeting, 0),
  }

  const total     = Object.values(o).reduce((a, b) => a + b, 0)
  // Contacted = anything except Scheduled, No Show, Rescheduled
  const contacted = o.completed + o.cancelled + o.expectedWithin3 + o.expectedWithin6 + o.noInterest + o.disqualifiedMeeting

  const pct = (n: number) => total > 0 ? ` (${Math.round(n / total * 100)}%)` : ""

  const cards = [
    { label: "Møder Booket",             sub: "12 uger total",                    value: String(total)                              },
    { label: "Kontaktede Møder",         sub: "ekskl. planlagt, no show, genplac.", value: String(contacted) + pct(contacted)       },
    { label: "Planlagt",                 sub: "SCHEDULED",                         value: String(o.scheduled)                       },
    { label: "No Show",                  sub: "NO_SHOW",                           value: String(o.noShow) + pct(o.noShow)          },
    { label: "Gennemført",               sub: "COMPLETED",                         value: String(o.completed) + pct(o.completed)    },
    { label: "Genplaceret",              sub: "RESCHEDULED",                        value: String(o.rescheduled)                     },
    { label: "Aflyst",                   sub: "CANCELED",                          value: String(o.cancelled) + pct(o.cancelled)    },
    { label: "Forv. invest. 3 mdr.",     sub: "Expected investment within 3",      value: String(o.expectedWithin3) + pct(o.expectedWithin3)  },
    { label: "Forv. invest. 6–9 mdr.",   sub: "Expected investment within 6",      value: String(o.expectedWithin6) + pct(o.expectedWithin6)  },
    { label: "Ingen interesse",          sub: "The customer has no interest",      value: String(o.noInterest) + pct(o.noInterest)  },
    { label: "Diskvalificeret møde",     sub: "DISQUALIFIED_MEETING",             value: String(o.disqualifiedMeeting) + pct(o.disqualifiedMeeting) },
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
