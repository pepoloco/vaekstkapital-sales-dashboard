"use client"
import { Consultant } from "@/types/sales"

interface Props {
  consultants: Consultant[]
  portalId: string
  hubDomain: string
}

export default function KpiCards({ consultants, portalId, hubDomain }: Props) {
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

  const meetingsBase = portalId ? `https://${hubDomain}/contacts/${portalId}/objects/0-47` : null

  const cards = [
    { label: "Møder Booket",             sub: "12 uger total",                     value: String(total),                                             href: meetingsBase },
    { label: "Kontaktede Møder",         sub: "ekskl. planlagt, no show, genplac.", value: String(contacted) + pct(contacted),                       href: meetingsBase },
    { label: "Planlagt",                 sub: "SCHEDULED",                          value: String(o.scheduled),                                       href: meetingsBase },
    { label: "No Show",                  sub: "NO_SHOW",                            value: String(o.noShow) + pct(o.noShow),                          href: meetingsBase },
    { label: "Gennemført",               sub: "COMPLETED",                          value: String(o.completed) + pct(o.completed),                    href: meetingsBase },
    { label: "Genplaceret",              sub: "RESCHEDULED",                        value: String(o.rescheduled),                                     href: meetingsBase },
    { label: "Aflyst",                   sub: "CANCELED",                           value: String(o.cancelled) + pct(o.cancelled),                    href: meetingsBase },
    { label: "Forv. invest. 3 mdr.",     sub: "Expected investment within 3",       value: String(o.expectedWithin3) + pct(o.expectedWithin3),        href: meetingsBase },
    { label: "Forv. invest. 6–9 mdr.",   sub: "Expected investment within 6",       value: String(o.expectedWithin6) + pct(o.expectedWithin6),        href: meetingsBase },
    { label: "Ingen interesse",          sub: "The customer has no interest",       value: String(o.noInterest) + pct(o.noInterest),                  href: meetingsBase },
    { label: "Diskvalificeret møde",     sub: "DISQUALIFIED_MEETING",              value: String(o.disqualifiedMeeting) + pct(o.disqualifiedMeeting), href: meetingsBase },
  ]

  return (
    <div className="kpi-grid">
      {cards.map(c => {
        const inner = (
          <>
            <div className="kpi-lbl">{c.label}</div>
            <div className="kpi-val">{c.value}</div>
            <div className="kpi-sub">{c.sub}</div>
          </>
        )
        return c.href ? (
          <a key={c.label} className="kpi-card kpi-link" href={c.href} target="_blank" rel="noopener noreferrer">
            {inner}
          </a>
        ) : (
          <div key={c.label} className="kpi-card">{inner}</div>
        )
      })}
    </div>
  )
}
