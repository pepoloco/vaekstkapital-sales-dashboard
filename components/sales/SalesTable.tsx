"use client"
import { useState, useMemo } from "react"
import { Consultant, MeetingRef } from "@/types/sales"

type SK = "name" | "meetingIndex" | "salesIndex" | "totalMeetings" | "totalAmount" | "totalCount" | "avgTicketSize" | "convDurationAvg" | "hitRate" | "leadsDifference" | "numberOfLeads"

interface Props {
  consultants: Consultant[]
  portalId: string
  hubDomain: string
  onOpenModal: (meetings: MeetingRef[], label: string) => void
}

const KPI = { physical: 5, teams: 3, dinner: 2, webinar: 15 }

function kpiClass(actual: number, weeklyTarget: number): string {
  const target = weeklyTarget * 4
  if (actual >= target)        return "gn"
  if (actual >= target * 0.5)  return "am"
  return "rd"
}

export default function SalesTable({ consultants, portalId, hubDomain, onOpenModal }: Props) {
  const [sk, setSk]         = useState<SK>("meetingIndex")
  const [dir, setDir]       = useState<"asc"|"desc">("desc")
  const [weekly, setWeekly] = useState(false)
  const [q, setQ]           = useState("")

  const rows = useMemo(() =>
    [...consultants]
      .filter(c => c.name.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => {
        const av = a[sk], bv = b[sk]
        if (typeof av === "string" && typeof bv === "string")
          return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
        const na = (typeof av === "number" && isFinite(av)) ? av : 0
        const nb = (typeof bv === "number" && isFinite(bv)) ? bv : 0
        return dir === "desc" ? nb - na : na - nb
      }),
    [consultants, sk, dir, q]
  )

  const th = (label: string, k?: SK, center?: boolean, title?: string) => (
    <th key={label} className={`th${k ? " sort" : ""}${center ? " c" : ""}`}
        title={title}
        onClick={() => { if (!k) return; if (sk === k) setDir(d => d === "desc" ? "asc" : "desc"); else { setSk(k); setDir("desc") } }}>
      {label}{k && sk === k ? (dir === "desc" ? " ↓" : " ↑") : ""}
    </th>
  )

  return (
    <div className="tw">
      <div className="bar">
        <span className="sec-ttl">Konsulenter</span>
        <div className="bar-r">
          <input className="srch" placeholder="Søg konsulenter…" value={q} onChange={e => setQ(e.target.value)} />
          <button className={`tbtn${weekly ? " on" : ""}`} onClick={() => setWeekly(v => !v)}>
            {weekly ? "Skjul" : "Vis"} U1–U12
          </button>
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th className="tg" colSpan={4}>Performance</th>
              <th className="tg" colSpan={weekly ? 3 + 12 : 3}>Resultater (12 uger)</th>
              <th className="tg" colSpan={4}>Indsats (4 uger) · mål {KPI.physical}/{KPI.teams}/{KPI.dinner}/{KPI.webinar}/uge</th>
              <th className="tg" colSpan={9}>Mødeudbytte (12 uger)</th>
              <th className="tg" colSpan={4}>Metrics</th>
            </tr>
            <tr>
              {th("Konsulent", "name")}
              {th("Møde IDX", "meetingIndex", true, "Relativt mødeindeks: (konsulentens møder / teamgennemsnit) × 100. 100 = gennemsnit. Klik for at sortere.")}
              {th("Salgs IDX", "salesIndex", true, "Relativt salgsindeks: (konsulentens salgsbeløb / teamgennemsnit) × 100. 100 = gennemsnit. Klik for at sortere.")}
              {th("Møder", "totalMeetings", true, "Absolut antal møder booket i 12-ugers vinduet")}
              {th("Beløb", "totalAmount", true)}
              {th("Antal", "totalCount", true)}
              {th("Ticket Str.", "avgTicketSize", true)}
              {weekly && Array.from({ length: 12 }, (_, i) => th(`U${i+1}`, undefined, true))}
              {th(`Fysisk ▸${KPI.physical}`, undefined, true)}
              {th(`Teams ▸${KPI.teams}`, undefined, true)}
              {th(`Middag ▸${KPI.dinner}`, undefined, true)}
              {th(`Webinar ▸${KPI.webinar}`, undefined, true)}
              {th("Planlagt", undefined, true)}
              {th("Gennemført", undefined, true)}
              {th("Genplaceret", undefined, true)}
              {th("No Show", undefined, true)}
              {th("Aflyst", undefined, true)}
              {th("Inv. 3 mdr.", undefined, true)}
              {th("Inv. 6–9 mdr.", undefined, true)}
              {th("Ingen int.", undefined, true)}
              {th("Diskvalif.", undefined, true)}
              {th("Konv.Var.", "convDurationAvg", true)}
              {th("Hit Rate", "hitRate", true)}
              {th("Kont. Δ", "leadsDifference", true)}
              {th("Kontakter", "numberOfLeads", true)}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={99} className="empty">Ingen konsulenter fundet</td></tr>}
            {rows.map((c, i) => {
              const o     = c.outcomes
              const om    = c.outcomeMeetings
              const total = Object.values(o).reduce((a, b) => a + b, 0)
              const pct   = (n: number) => (n > 0 && total > 0) ? <span className="pct"> {Math.round(n / total * 100)}%</span> : null

              const cell = (n: number, refs: MeetingRef[], name: string, cls = "") => (
                <td
                  className={`td mn c${cls ? " " + cls : ""}${refs.length > 0 ? " clickable-cell" : ""}`}
                  onClick={refs.length > 0 ? () => onOpenModal(refs, `${c.name} — ${name}`) : undefined}
                >
                  {n > 0 ? <>{n}{pct(n)}</> : <span className="dm">–</span>}
                </td>
              )

              return (
                <tr key={c.id} className={`row${i % 2 === 0 ? " even" : ""}`}>
                  <td className="td nm">{c.name}</td>
                  <td className="td c" title={`${c.totalMeetings} møder / teamgennemsnit = ${c.meetingIndex}`}>
                    <IBar v={c.meetingIndex} sub={c.totalMeetings} />
                  </td>
                  <td className="td c"><IBar v={c.salesIndex} /></td>
                  <td className="td mn c">{c.totalMeetings}</td>
                  <td className="td mn r">€{c.totalAmount.toLocaleString("da-DK")}</td>
                  <td className="td mn c">{c.totalCount}</td>
                  <td className="td mn r">€{c.avgTicketSize.toLocaleString("da-DK")}</td>
                  {weekly && Array.from({ length: 12 }, (_, wi) => {
                    const w     = c.weeklyResults.find(r => r.week === wi + 1)
                    const t     = w ? w.physical + w.teams + w.dinner + w.webinar : 0
                    const refs  = w?.meetings ?? []
                    const label = `${c.name} — Uge ${wi + 1}`
                    const badge = t > 0 ? <span className="wd">{t}</span> : <span className="dm">–</span>
                    return (
                      <td key={wi} className="td mn c">
                        {refs.length === 1 ? (
                          <a
                            href={
                              refs[0].companyId && portalId
                                ? `https://${hubDomain}/contacts/${portalId}/record/0-2/${refs[0].companyId}/view/1?engagement=${refs[0].id}`
                                : portalId
                                  ? `https://${hubDomain}/contacts/${portalId}/objects/0-47/views/all/list`
                                  : "#"
                            }
                            target="_blank" rel="noopener noreferrer"
                            className="wk-link"
                            title={refs[0].title}
                          >{badge}</a>
                        ) : refs.length > 1 ? (
                          <span
                            className="wk-link"
                            onClick={() => onOpenModal(refs, label)}
                            style={{ cursor: "pointer" }}
                          >{badge}</span>
                        ) : badge}
                      </td>
                    )
                  })}
                  <td className={`td mn c ${kpiClass(c.effort.physical, KPI.physical)}`}>{c.effort.physical}</td>
                  <td className={`td mn c ${kpiClass(c.effort.teams, KPI.teams)}`}>{c.effort.teams}</td>
                  <td className={`td mn c ${kpiClass(c.effort.dinner, KPI.dinner)}`}>{c.effort.dinner}</td>
                  <td className={`td mn c ${kpiClass(c.effort.webinar, KPI.webinar)}`}>{c.effort.webinar}</td>
                  {cell(o.scheduled,           om.scheduled,           "Planlagt")}
                  {cell(o.completed,           om.completed,           "Gennemført",   "gn")}
                  {cell(o.rescheduled,         om.rescheduled,         "Genplaceret")}
                  {cell(o.noShow,              om.noShow,              "No Show",      "rd")}
                  {cell(o.cancelled,           om.cancelled,           "Aflyst",       "am")}
                  <td
                    className={`td mn c${om.expectedWithin3.length > 0 ? " clickable-cell" : ""}`}
                    style={{ color: o.expectedWithin3 > 0 ? "#0ea5e9" : undefined, fontWeight: o.expectedWithin3 > 0 ? 500 : undefined }}
                    onClick={om.expectedWithin3.length > 0 ? () => onOpenModal(om.expectedWithin3, `${c.name} — Inv. 3 mdr.`) : undefined}
                  >
                    {o.expectedWithin3 > 0 ? <>{o.expectedWithin3}{pct(o.expectedWithin3)}</> : <span className="dm">–</span>}
                  </td>
                  <td
                    className={`td mn c${om.expectedWithin6.length > 0 ? " clickable-cell" : ""}`}
                    style={{ color: o.expectedWithin6 > 0 ? "#0ea5e9" : undefined, fontWeight: o.expectedWithin6 > 0 ? 500 : undefined }}
                    onClick={om.expectedWithin6.length > 0 ? () => onOpenModal(om.expectedWithin6, `${c.name} — Inv. 6–9 mdr.`) : undefined}
                  >
                    {o.expectedWithin6 > 0 ? <>{o.expectedWithin6}{pct(o.expectedWithin6)}</> : <span className="dm">–</span>}
                  </td>
                  {cell(o.noInterest,          om.noInterest,          "Ingen int.")}
                  {cell(o.disqualifiedMeeting, om.disqualifiedMeeting, "Diskvalif.")}
                  <td className="td mn c">{c.convDurationAvg.toFixed(1)}m</td>
                  <td className="td mn c">{(c.hitRate * 100).toFixed(1)}%</td>
                  <td className={`td mn c ${c.leadsDifference >= 0 ? "gn" : "rd"}`}>{c.leadsDifference >= 0 ? "+" : ""}{c.leadsDifference}</td>
                  <td className="td mn c">{c.numberOfLeads.toLocaleString("da-DK")}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function IBar({ v, sub }: { v: number; sub?: number }) {
  const p  = Math.min(v / 200, 1)
  const bg = p >= 0.75 ? "#059669" : p >= 0.45 ? "#d97706" : "#dc2626"
  return (
    <div className="ib">
      <span className="iv">{v}</span>
      <div className="it"><div className="if" style={{ width: `${p * 100}%`, background: bg }} /></div>
      {sub !== undefined && <span style={{ fontSize: 10, color: "var(--muted)", minWidth: 24 }}>{sub}</span>}
    </div>
  )
}
