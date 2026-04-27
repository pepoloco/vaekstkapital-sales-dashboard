"use client"
import { Consultant, MeetingOutcomes } from "@/types/sales"

interface Props {
  consultants: Consultant[]
  portalId: string
  hubDomain: string
  onOpenModal: (ids: string[], label: string) => void
}

function aggIds(consultants: Consultant[], key: keyof MeetingOutcomes): string[] {
  return consultants.flatMap(c => c.outcomeIds[key])
}

export default function KpiCards({ consultants, onOpenModal }: Props) {
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
  const contacted = o.completed + o.cancelled + o.expectedWithin3 + o.expectedWithin6 + o.noInterest + o.disqualifiedMeeting

  const pct = (n: number) => total > 0 ? ` (${Math.round(n / total * 100)}%)` : ""

  const allIds       = consultants.flatMap(c => Object.values(c.outcomeIds).flat())
  const contactedIds = consultants.flatMap(c => [
    ...c.outcomeIds.completed, ...c.outcomeIds.cancelled,
    ...c.outcomeIds.expectedWithin3, ...c.outcomeIds.expectedWithin6,
    ...c.outcomeIds.noInterest, ...c.outcomeIds.disqualifiedMeeting,
  ])

  const cards: { label: string; sub: string; value: string; ids: string[] }[] = [
    { label: "Møder Booket",           sub: "12 uger total",                     value: String(total),                                              ids: allIds       },
    { label: "Kontaktede Møder",       sub: "ekskl. planlagt, no show, genplac.", value: String(contacted) + pct(contacted),                        ids: contactedIds },
    { label: "Planlagt",               sub: "SCHEDULED",                          value: String(o.scheduled),                                        ids: aggIds(consultants, "scheduled")           },
    { label: "No Show",                sub: "NO_SHOW",                            value: String(o.noShow) + pct(o.noShow),                           ids: aggIds(consultants, "noShow")              },
    { label: "Gennemført",             sub: "COMPLETED",                          value: String(o.completed) + pct(o.completed),                     ids: aggIds(consultants, "completed")           },
    { label: "Genplaceret",            sub: "RESCHEDULED",                        value: String(o.rescheduled),                                      ids: aggIds(consultants, "rescheduled")         },
    { label: "Aflyst",                 sub: "CANCELED",                           value: String(o.cancelled) + pct(o.cancelled),                     ids: aggIds(consultants, "cancelled")           },
    { label: "Forv. invest. 3 mdr.",   sub: "Expected investment within 3",       value: String(o.expectedWithin3) + pct(o.expectedWithin3),         ids: aggIds(consultants, "expectedWithin3")     },
    { label: "Forv. invest. 6–9 mdr.", sub: "Expected investment within 6",       value: String(o.expectedWithin6) + pct(o.expectedWithin6),         ids: aggIds(consultants, "expectedWithin6")     },
    { label: "Ingen interesse",        sub: "The customer has no interest",       value: String(o.noInterest) + pct(o.noInterest),                   ids: aggIds(consultants, "noInterest")          },
    { label: "Diskvalificeret møde",   sub: "DISQUALIFIED_MEETING",              value: String(o.disqualifiedMeeting) + pct(o.disqualifiedMeeting),  ids: aggIds(consultants, "disqualifiedMeeting") },
  ]

  return (
    <div className="kpi-grid">
      {cards.map(c => {
        const clickable = c.ids.length > 0
        return (
          <div
            key={c.label}
            className={`kpi-card${clickable ? " kpi-link" : ""}`}
            onClick={clickable ? () => onOpenModal(c.ids, c.label) : undefined}
            role={clickable ? "button" : undefined}
          >
            <div className="kpi-lbl">{c.label}</div>
            <div className="kpi-val">{c.value}</div>
            <div className="kpi-sub">{c.sub}</div>
          </div>
        )
      })}
    </div>
  )
}
