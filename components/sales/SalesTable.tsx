"use client"
import { useState, useMemo } from "react"
import { Consultant } from "@/types/sales"

type SK = "name" | "meetingIndex" | "salesIndex" | "totalAmount" | "totalCount" | "avgTicketSize" | "convDurationAvg" | "hitRate" | "leadsDifference" | "numberOfLeads"

const KPI = { physical: 5, teams: 3, dinner: 2, webinar: 15 }

function kpiClass(actual: number, weeklyTarget: number): string {
  const target = weeklyTarget * 4
  if (actual >= target)        return "gn"
  if (actual >= target * 0.5)  return "am"
  return "rd"
}

function outcomeClass(label: string): string {
  if (label === "completed") return "gn"
  if (label === "noShow")    return "rd"
  if (label === "cancelled") return "am"
  return ""
}

export default function SalesTable({ consultants }: { consultants: Consultant[] }) {
  const [sk, setSk]         = useState<SK>("meetingIndex")
  const [dir, setDir]       = useState<"asc"|"desc">("desc")
  const [weekly, setWeekly] = useState(false)
  const [q, setQ]           = useState("")

  const rows = useMemo(() =>
    [...consultants]
      .filter(c => c.name.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => {
        const av = a[sk]
        const bv = b[sk]
        if (typeof av === "string" && typeof bv === "string")
          return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
        const na = (typeof av === "number" && isFinite(av)) ? av : 0
        const nb = (typeof bv === "number" && isFinite(bv)) ? bv : 0
        return dir === "desc" ? nb - na : na - nb
      }),
    [consultants, sk, dir, q]
  )

  const th = (label: string, k?: SK, center?: boolean) => (
    <th key={label} className={`th${k ? " sort" : ""}${center ? " c" : ""}`}
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
              <th className="tg" colSpan={3}>Performance</th>
              <th className="tg" colSpan={weekly ? 3 + 12 : 3}>Resultater (12 uger)</th>
              <th className="tg" colSpan={4}>Indsats (4 uger) · mål {KPI.physical}/{KPI.teams}/{KPI.dinner}/{KPI.webinar}/uge</th>
              <th className="tg" colSpan={3}>Mødeudbytte (12 uger)</th>
              <th className="tg" colSpan={4}>Metrics</th>
            </tr>
            <tr>
              {th("Konsulent", "name")}
              {th("Møde Idx", "meetingIndex", true)}
              {th("Salgs Idx", "salesIndex", true)}
              {th("Beløb", "totalAmount", true)}
              {th("Antal", "totalCount", true)}
              {th("Ticket Str.", "avgTicketSize", true)}
              {weekly && Array.from({ length: 12 }, (_, i) => th(`U${i+1}`, undefined, true))}
              {th(`Fysisk ▸${KPI.physical}`, undefined, true)}
              {th(`Teams ▸${KPI.teams}`, undefined, true)}
              {th(`Middag ▸${KPI.dinner}`, undefined, true)}
              {th(`Webinar ▸${KPI.webinar}`, undefined, true)}
              {th("Gennemført", undefined, true)}
              {th("No Show", undefined, true)}
              {th("Aflyst", undefined, true)}
              {th("Konv.Var.", "convDurationAvg", true)}
              {th("Hit Rate", "hitRate", true)}
              {th("Kontakter Δ", "leadsDifference", true)}
              {th("Kontakter", "numberOfLeads", true)}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={99} className="empty">Ingen konsulenter fundet</td></tr>}
            {rows.map((c, i) => {
              const totalMeetings = c.outcomes.completed + c.outcomes.noShow + c.outcomes.cancelled + c.outcomes.scheduled
              return (
                <tr key={c.id} className={`row${i % 2 === 0 ? " even" : ""}`}>
                  <td className="td nm">{c.name}</td>
                  <td className="td c"><IBar v={c.meetingIndex} /></td>
                  <td className="td c"><IBar v={c.salesIndex} /></td>
                  <td className="td mn r">€{c.totalAmount.toLocaleString("da-DK")}</td>
                  <td className="td mn c">{c.totalCount}</td>
                  <td className="td mn r">€{c.avgTicketSize.toLocaleString("da-DK")}</td>
                  {weekly && Array.from({ length: 12 }, (_, i) => {
                    const w = c.weeklyResults.find(r => r.week === i + 1)
                    const t = w ? w.physical + w.teams + w.dinner + w.webinar : 0
                    return <td key={i} className="td mn c">{t > 0 ? <span className="wd">{t}</span> : <span className="dm">–</span>}</td>
                  })}
                  <td className={`td mn c ${kpiClass(c.effort.physical, KPI.physical)}`}>{c.effort.physical}</td>
                  <td className={`td mn c ${kpiClass(c.effort.teams, KPI.teams)}`}>{c.effort.teams}</td>
                  <td className={`td mn c ${kpiClass(c.effort.dinner, KPI.dinner)}`}>{c.effort.dinner}</td>
                  <td className={`td mn c ${kpiClass(c.effort.webinar, KPI.webinar)}`}>{c.effort.webinar}</td>
                  <td className="td mn c gn">{c.outcomes.completed}{totalMeetings > 0 && <span className="pct"> {Math.round(c.outcomes.completed / totalMeetings * 100)}%</span>}</td>
                  <td className="td mn c rd">{c.outcomes.noShow}{totalMeetings > 0 && <span className="pct"> {Math.round(c.outcomes.noShow / totalMeetings * 100)}%</span>}</td>
                  <td className="td mn c am">{c.outcomes.cancelled}{totalMeetings > 0 && <span className="pct"> {Math.round(c.outcomes.cancelled / totalMeetings * 100)}%</span>}</td>
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

function IBar({ v }: { v: number }) {
  const p  = Math.min(v / 200, 1)
  const bg = p >= 0.75 ? "#059669" : p >= 0.45 ? "#d97706" : "#dc2626"
  return (
    <div className="ib">
      <span className="iv">{v}</span>
      <div className="it"><div className="if" style={{ width: `${p * 100}%`, background: bg }} /></div>
    </div>
  )
}
