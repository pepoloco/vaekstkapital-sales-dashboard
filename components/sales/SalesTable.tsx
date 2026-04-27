"use client"
import { useState, useMemo } from "react"
import { Consultant } from "@/types/sales"

type SK = "name" | "meetingIndex" | "salesIndex" | "totalAmount" | "totalCount" | "avgTicketSize" | "convDurationAvg" | "hitRate" | "leadsDifference" | "numberOfLeads"

export default function SalesTable({ consultants }: { consultants: Consultant[] }) {
  const [sk, setSk]         = useState<SK>("salesIndex")
  const [dir, setDir]       = useState<"asc"|"desc">("desc")
  const [weekly, setWeekly] = useState(false)
  const [q, setQ]           = useState("")

  const rows = useMemo(() =>
    [...consultants]
      .filter(c => c.name.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => {
        const av = a[sk] as any
        const bv = b[sk] as any
        if (typeof av === "string") return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
        return dir === "desc" ? bv - av : av - bv
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
        <input className="srch" placeholder="Search consultants…" value={q} onChange={e => setQ(e.target.value)} />
        <button className={`tbtn${weekly ? " on" : ""}`} onClick={() => setWeekly(v => !v)}>
          {weekly ? "Hide" : "Show"} W1–W12
        </button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th className="tg" colSpan={4}>Performance</th>
              <th className="tg" colSpan={weekly ? 3 + 12 : 3}>Results (12 weeks)</th>
              <th className="tg" colSpan={4}>Effort (4 weeks)</th>
              <th className="tg" colSpan={4}>Metrics</th>
            </tr>
            <tr>
              {th("Consultant", "name")}
              {th("Meeting Idx", "meetingIndex", true)}
              {th("Sales Idx", "salesIndex", true)}
              {th("Trending", undefined, true)}
              {th("Amount", "totalAmount", true)}
              {th("Count", "totalCount", true)}
              {th("Ticket Size", "avgTicketSize", true)}
              {weekly && Array.from({ length: 12 }, (_, i) => th(`W${i+1}`, undefined, true))}
              {th("Physical", undefined, true)}
              {th("Teams", undefined, true)}
              {th("Dinner", undefined, true)}
              {th("Webinar", undefined, true)}
              {th("Conv.Dur", "convDurationAvg", true)}
              {th("Hit Rate", "hitRate", true)}
              {th("Leads Δ", "leadsDifference", true)}
              {th("# Leads", "numberOfLeads", true)}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={99} className="empty">No consultants found</td></tr>}
            {rows.map((c, i) => (
              <tr key={c.id} className={`row${i % 2 === 0 ? " even" : ""}`}>
                <td className="td nm">{c.name}</td>
                <td className="td c"><IBar v={c.meetingIndex} /></td>
                <td className="td c"><IBar v={c.salesIndex} /></td>
                <td className="td c"><span className={`bdg ${c.trendPositive ? "pos" : "neg"}`}>{c.trendPositive ? "▲ Yes" : "▼ No"}</span></td>
                <td className="td mn r">€{c.totalAmount.toLocaleString("da-DK")}</td>
                <td className="td mn c">{c.totalCount}</td>
                <td className="td mn r">€{c.avgTicketSize.toLocaleString("da-DK")}</td>
                {weekly && Array.from({ length: 12 }, (_, i) => {
                  const w = c.weeklyResults.find(r => r.week === i + 1)
                  const t = w ? w.physical + w.teams + w.dinner + w.webinar : 0
                  return <td key={i} className="td mn c">{t > 0 ? <span className="wd">{t}</span> : <span className="dm">–</span>}</td>
                })}
                <td className="td mn c">{c.effort.physical}</td>
                <td className="td mn c">{c.effort.teams}</td>
                <td className="td mn c">{c.effort.dinner}</td>
                <td className="td mn c">{c.effort.webinar}</td>
                <td className="td mn c">{c.convDurationAvg.toFixed(1)}m</td>
                <td className="td mn c">{(c.hitRate * 100).toFixed(1)}%</td>
                <td className={`td mn c ${c.leadsDifference >= 0 ? "gn" : "rd"}`}>{c.leadsDifference >= 0 ? "+" : ""}{c.leadsDifference}</td>
                <td className="td mn c">{c.numberOfLeads.toLocaleString("da-DK")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function IBar({ v }: { v: number }) {
  const p = Math.min(v / 200, 1)
  const bg = p >= 0.75 ? "#4ade80" : p >= 0.45 ? "#fbbf24" : "#f87171"
  return (
    <div className="ib">
      <span className="iv">{v}</span>
      <div className="it"><div className="if" style={{ width: `${p * 100}%`, background: bg }} /></div>
    </div>
  )
}
