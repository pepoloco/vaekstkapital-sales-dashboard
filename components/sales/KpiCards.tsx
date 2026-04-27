"use client"
import { Consultant, MeetingOutcomes, MeetingRef } from "@/types/sales"

interface Props {
  consultants: Consultant[]
  portalId: string
  hubDomain: string
  onOpenModal: (meetings: MeetingRef[], label: string) => void
}

function aggMeetings(consultants: Consultant[], key: keyof MeetingOutcomes): MeetingRef[] {
  return consultants.flatMap(c => c.outcomeMeetings[key])
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

  const allMeetings       = consultants.flatMap(c => Object.values(c.outcomeMeetings).flat())
  const contactedMeetings = consultants.flatMap(c => [
    ...c.outcomeMeetings.completed, ...c.outcomeMeetings.cancelled,
    ...c.outcomeMeetings.expectedWithin3, ...c.outcomeMeetings.expectedWithin6,
    ...c.outcomeMeetings.noInterest, ...c.outcomeMeetings.disqualifiedMeeting,
  ])

  const cards: { label: string; sub: string; value: string; meetings: MeetingRef[] }[] = [
    { label: "Møder Booket",           sub: "12 uger total",                     value: String(total),                                              meetings: allMeetings                                        },
    { label: "Kontaktede Møder",       sub: "ekskl. planlagt, no show, genplac.", value: String(contacted) + pct(contacted),                        meetings: contactedMeetings                                  },
    { label: "Planlagt",               sub: "SCHEDULED",                          value: String(o.scheduled),                                        meetings: aggMeetings(consultants, "scheduled")              },
    { label: "No Show",                sub: "NO_SHOW",                            value: String(o.noShow) + pct(o.noShow),                           meetings: aggMeetings(consultants, "noShow")                 },
    { label: "Gennemført",             sub: "COMPLETED",                          value: String(o.completed) + pct(o.completed),                     meetings: aggMeetings(consultants, "completed")              },
    { label: "Genplaceret",            sub: "RESCHEDULED",                        value: String(o.rescheduled),                                      meetings: aggMeetings(consultants, "rescheduled")            },
    { label: "Aflyst",                 sub: "CANCELED",                           value: String(o.cancelled) + pct(o.cancelled),                     meetings: aggMeetings(consultants, "cancelled")              },
    { label: "Forv. invest. 3 mdr.",   sub: "Expected investment within 3",       value: String(o.expectedWithin3) + pct(o.expectedWithin3),         meetings: aggMeetings(consultants, "expectedWithin3")        },
    { label: "Forv. invest. 6–9 mdr.", sub: "Expected investment within 6",       value: String(o.expectedWithin6) + pct(o.expectedWithin6),         meetings: aggMeetings(consultants, "expectedWithin6")        },
    { label: "Ingen interesse",        sub: "The customer has no interest",       value: String(o.noInterest) + pct(o.noInterest),                   meetings: aggMeetings(consultants, "noInterest")             },
    { label: "Diskvalificeret møde",   sub: "DISQUALIFIED_MEETING",              value: String(o.disqualifiedMeeting) + pct(o.disqualifiedMeeting),  meetings: aggMeetings(consultants, "disqualifiedMeeting")    },
  ]

  return (
    <div className="kpi-grid">
      {cards.map(c => {
        const clickable = c.meetings.length > 0
        return (
          <div
            key={c.label}
            className={`kpi-card${clickable ? " kpi-link" : ""}`}
            onClick={clickable ? () => onOpenModal(c.meetings, c.label) : undefined}
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
