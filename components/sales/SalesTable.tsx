<<<<<<< HEAD
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
=======
"use client";
import { useState, useMemo } from "react";
import { Consultant } from "@/types/sales";

type SortKey =
  | "name"
  | "meetingIndex"
  | "salesIndex"
  | "totalAmount"
  | "totalCount"
  | "avgTicketSize"
  | "convDurationAvg"
  | "hitRate"
  | "leadsDifference"
  | "numberOfLeads";

interface SalesTableProps {
  consultants: Consultant[];
  periodStart: string;
}

export default function SalesTable({ consultants, periodStart }: SalesTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("meetingIndex");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showWeekly, setShowWeekly] = useState(false);
  const [search, setSearch] = useState("");

  const sorted = useMemo(() => {
    const filtered = consultants.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] as number | string;
      const bv = b[sortKey] as number | string;
      if (typeof av === "string") {
        return sortDir === "asc"
          ? av.localeCompare(bv as string)
          : (bv as string).localeCompare(av);
      }
      return sortDir === "desc" ? (bv as number) - av : av - (bv as number);
    });
  }, [consultants, sortKey, sortDir, search]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const Th = ({
    label,
    k,
    right,
  }: {
    label: string;
    k?: SortKey;
    right?: boolean;
  }) => (
    <th
      className={`th ${right ? "text-right" : "text-left"} ${k ? "sortable" : ""}`}
      onClick={() => k && toggleSort(k)}
    >
      <span>{label}</span>
      {k && sortKey === k && (
        <span className="sort-arrow">{sortDir === "desc" ? " ↓" : " ↑"}</span>
      )}
    </th>
  );

  return (
    <div className="table-wrapper">
      {/* Toolbar */}
      <div className="table-toolbar">
        <input
          className="search-input"
          placeholder="Search consultants…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className={`toggle-btn ${showWeekly ? "active" : ""}`}
          onClick={() => setShowWeekly(!showWeekly)}
        >
          {showWeekly ? "Hide" : "Show"} W1–W12
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="sales-table">
          <thead>
            <tr>
              {/* Performance */}
              <th className="th-group" colSpan={4}>Performance</th>
              {/* Results */}
              <th className="th-group" colSpan={showWeekly ? 15 : 3}>Results (12 weeks)</th>
              {/* Effort */}
              <th className="th-group" colSpan={4}>Effort (4 weeks)</th>
              {/* Metrics */}
              <th className="th-group" colSpan={4}>Metrics</th>
            </tr>
            <tr>
              <Th label="Consultant" k="name" />
              <Th label="Meeting Index" k="meetingIndex" right />
              <Th label="Sales Index" k="salesIndex" right />
              <Th label="Trend" />

              <Th label="Amount" k="totalAmount" right />
              <Th label="Count" k="totalCount" right />
              <Th label="Ticket Size" k="avgTicketSize" right />

              {showWeekly &&
                Array.from({ length: 12 }, (_, i) => (
                  <Th key={i} label={`W${i + 1}`} right />
                ))}

              <Th label="Physical" right />
              <Th label="Teams" right />
              <Th label="Dinner" right />
              <Th label="Webinar" right />

              <Th label="Conv. Dur." k="convDurationAvg" right />
              <Th label="Hit Rate" k="hitRate" right />
              <Th label="Leads Δ" k="leadsDifference" right />
              <Th label="# Leads" k="numberOfLeads" right />
            </tr>
          </thead>

          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={99} className="empty-row">No consultants found</td>
              </tr>
            )}
            {sorted.map((c, idx) => (
              <tr key={c.id} className={`data-row ${idx % 2 === 0 ? "even" : ""}`}>
                <td className="td name-cell">{c.name}</td>

                {/* Meeting Index */}
                <td className="td text-right">
                  <IndexBar value={c.meetingIndex} />
                </td>

                {/* Sales Index */}
                <td className="td text-right">
                  <IndexBar value={c.salesIndex} />
                </td>

                {/* Trend */}
                <td className="td text-center">
                  <span className={`trend-badge ${c.trendPositive ? "positive" : "negative"}`}>
                    {c.trendPositive ? "▲ Yes" : "▼ No"}
                  </span>
                </td>

                <td className="td text-right mono">
                  €{c.totalAmount.toLocaleString("da-DK", { maximumFractionDigits: 0 })}
                </td>
                <td className="td text-right mono">{c.totalCount}</td>
                <td className="td text-right mono">
                  €{Math.round(c.avgTicketSize).toLocaleString("da-DK")}
                </td>

                {showWeekly &&
                  Array.from({ length: 12 }, (_, i) => {
                    const w = c.weeklyResults.find((r) => r.week === i + 1);
                    const total = w ? w.physical + w.teams + w.dinner + w.webinar : 0;
                    return (
                      <td key={i} className="td text-right mono weekly-cell">
                        {total > 0 ? (
                          <span className="weekly-dot">{total}</span>
                        ) : (
                          <span className="text-gray-600">–</span>
                        )}
                      </td>
                    );
                  })}

                <td className="td text-right mono">{c.effort.physical}</td>
                <td className="td text-right mono">{c.effort.teams}</td>
                <td className="td text-right mono">{c.effort.dinner}</td>
                <td className="td text-right mono">{c.effort.webinar}</td>

                <td className="td text-right mono">{c.convDurationAvg.toFixed(1)}m</td>
                <td className="td text-right mono">{(c.hitRate * 100).toFixed(1)}%</td>
                <td className={`td text-right mono ${c.leadsDifference >= 0 ? "positive-text" : "negative-text"}`}>
                  {c.leadsDifference >= 0 ? "+" : ""}{c.leadsDifference}
                </td>
                <td className="td text-right mono">{c.numberOfLeads.toLocaleString("da-DK")}</td>
>>>>>>> 835103a4fbf78d0a460bcadcfa47078be90cb42b
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
<<<<<<< HEAD
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
=======
  );
}

function IndexBar({ value }: { value: number }) {
  const pct = Math.min(value / 200, 1);
  const color =
    pct >= 0.75 ? "#4ade80" : pct >= 0.45 ? "#fbbf24" : "#f87171";
  return (
    <div className="index-bar-wrap">
      <span className="index-value">{value}</span>
      <div className="index-track">
        <div
          className="index-fill"
          style={{ width: `${pct * 100}%`, background: color }}
        />
      </div>
    </div>
  );
>>>>>>> 835103a4fbf78d0a460bcadcfa47078be90cb42b
}
