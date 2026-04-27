"use client"
import { useState } from "react"
import { Consultant } from "@/types/sales"

const KPI = { physical: 5, teams: 3, dinner: 2, webinar: 15 }

function cls(actual: number, target: number): string {
  if (actual === 0) return "dm"
  if (actual >= target)          return "gn"
  if (actual >= target * 0.5)    return "am"
  return "rd"
}

interface Props { consultants: Consultant[] }

export default function WeeklyBreakdownTable({ consultants }: Props) {
  const [showAll, setShowAll] = useState(false)

  const weeks = showAll
    ? Array.from({ length: 12 }, (_, i) => i + 1)
    : [9, 10, 11, 12]

  return (
    <div className="tw">
      <div className="bar">
        <div>
          <span className="sec-ttl">Ugentlig mødefordeling</span>
          <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 10 }}>
            Mål/uge: fysisk {KPI.physical} · teams {KPI.teams} · middag {KPI.dinner} · webinar {KPI.webinar}
          </span>
        </div>
        <div className="bar-r">
          <button className={`tbtn${showAll ? " on" : ""}`} onClick={() => setShowAll(v => !v)}>
            {showAll ? "Vis kun uge 9–12" : "Vis alle 12 uger"}
          </button>
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th className="th" style={{ minWidth: 160 }} rowSpan={2}>Konsulent</th>
              {weeks.map(w => (
                <th key={w} className="tg" colSpan={4} style={{ borderLeft: "1px solid var(--bdr)" }}>
                  U{w}
                </th>
              ))}
            </tr>
            <tr>
              {weeks.flatMap(w => [
                <th key={`${w}-ph`} className="th c" style={{ fontSize: 9, borderLeft: "1px solid var(--bdr)", paddingLeft: 4, paddingRight: 4 }}>Ph</th>,
                <th key={`${w}-te`} className="th c" style={{ fontSize: 9, paddingLeft: 4, paddingRight: 4 }}>Te</th>,
                <th key={`${w}-di`} className="th c" style={{ fontSize: 9, paddingLeft: 4, paddingRight: 4 }}>Di</th>,
                <th key={`${w}-we`} className="th c" style={{ fontSize: 9, paddingLeft: 4, paddingRight: 4 }}>We</th>,
              ])}
            </tr>
          </thead>
          <tbody>
            <tr style={{ background: "#f5f3ef" }}>
              <td className="td" style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em" }}>
                Mål/uge
              </td>
              {weeks.flatMap(w => [
                <td key={`${w}-ph`} className="td mn c" style={{ fontSize: 10, color: "var(--tx2)", borderLeft: "1px solid var(--bdr)" }}>{KPI.physical}</td>,
                <td key={`${w}-te`} className="td mn c" style={{ fontSize: 10, color: "var(--tx2)" }}>{KPI.teams}</td>,
                <td key={`${w}-di`} className="td mn c" style={{ fontSize: 10, color: "var(--tx2)" }}>{KPI.dinner}</td>,
                <td key={`${w}-we`} className="td mn c" style={{ fontSize: 10, color: "var(--tx2)" }}>{KPI.webinar}</td>,
              ])}
            </tr>
            {consultants.map((c, i) => (
              <tr key={c.id} className={`row${i % 2 === 0 ? " even" : ""}`}>
                <td className="td nm">{c.name}</td>
                {weeks.flatMap(w => {
                  const wr = c.weeklyResults.find(r => r.week === w)
                  const ph = wr?.physical ?? 0
                  const te = wr?.teams    ?? 0
                  const di = wr?.dinner   ?? 0
                  const we = wr?.webinar  ?? 0
                  return [
                    <td key={`${w}-ph`} className={`td mn c ${cls(ph, KPI.physical)}`}
                        style={{ borderLeft: "1px solid var(--bdr)", padding: "8px 5px" }}>
                      {ph === 0 ? <span className="dm">–</span> : ph}
                    </td>,
                    <td key={`${w}-te`} className={`td mn c ${cls(te, KPI.teams)}`}
                        style={{ padding: "8px 5px" }}>
                      {te === 0 ? <span className="dm">–</span> : te}
                    </td>,
                    <td key={`${w}-di`} className={`td mn c ${cls(di, KPI.dinner)}`}
                        style={{ padding: "8px 5px" }}>
                      {di === 0 ? <span className="dm">–</span> : di}
                    </td>,
                    <td key={`${w}-we`} className={`td mn c ${cls(we, KPI.webinar)}`}
                        style={{ padding: "8px 5px" }}>
                      {we === 0 ? <span className="dm">–</span> : we}
                    </td>,
                  ]
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
