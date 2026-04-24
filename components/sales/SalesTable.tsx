<<<<<<< HEAD
"use client"
import { useState, useMemo } from "react"
import { Consultant } from "@/types/sales"

type SortKey = "name" | "meetingIndex" | "salesIndex" | "totalAmount" | "totalCount" | "avgTicketSize" | "convDurationAvg" | "hitRate" | "leadsDifference" | "numberOfLeads"

export default function SalesTable({ consultants }: { consultants: Consultant[] }) {
  const [sortKey, setSortKey]   = useState<SortKey>("salesIndex")
  const [sortDir, setSortDir]   = useState<"asc" | "desc">("desc")
  const [showWeekly, setShowWeekly] = useState(false)
  const [search, setSearch]     = useState("")

  const sorted = useMemo(() => {
    return [...consultants]
      .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        const av = a[sortKey] as any
        const bv = b[sortKey] as any
        if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
        return sortDir === "desc" ? bv - av : av - bv
      })
  }, [consultants, sortKey, sortDir, search])

  const toggle = (k: SortKey) => {
    if (sortKey === k) setSortDir(d => d === "desc" ? "asc" : "desc")
    else { setSortKey(k); setSortDir("desc") }
  }

  const Th = ({ label, k, center }: { label: string; k?: SortKey; center?: boolean }) => (
    <th className={`th${k ? " sortable" : ""}${center ? " center" : ""}`} onClick={() => k && toggle(k)}>
      {label}{k && sortKey === k ? (sortDir === "desc" ? " ↓" : " ↑") : ""}
    </th>
  )

  return (
    <div className="table-wrapper">
      <div className="toolbar">
        <input className="search" placeholder="Search consultants…" value={search} onChange={e => setSearch(e.target.value)} />
        <button className={`toggle-btn${showWeekly ? " active" : ""}`} onClick={() => setShowWeekly(v => !v)}>
          {showWeekly ? "Hide" : "Show"} W1–W12
        </button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              <th className="th-group" colSpan={4}>Performance</th>
              <th className="th-group" colSpan={showWeekly ? 3 + 12 : 3}>Results (12 weeks)</th>
              <th className="th-group" colSpan={4}>Effort (4 weeks)</th>
              <th className="th-group" colSpan={4}>Metrics</th>
            </tr>
            <tr>
              <Th label="Consultant"    k="name" />
              <Th label="Meeting Idx"   k="meetingIndex"   center />
              <Th label="Sales Idx"     k="salesIndex"     center />
              <Th label="Trending"      center />
              <Th label="Amount"        k="totalAmount"    center />
              <Th label="Count"         k="totalCount"     center />
              <Th label="Ticket Size"   k="avgTicketSize"  center />
              {showWeekly && Array.from({ length: 12 }, (_, i) => <Th key={i} label={`W${i+1}`} center />)}
              <Th label="Physical"  center />
              <Th label="Teams"     center />
              <Th label="Dinner"    center />
              <Th label="Webinar"   center />
              <Th label="Conv. Dur" k="convDurationAvg"  center />
              <Th label="Hit Rate"  k="hitRate"          center />
              <Th label="Leads Δ"   k="leadsDifference"  center />
              <Th label="# Leads"   k="numberOfLeads"    center />
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr><td colSpan={99} className="empty">No consultants found</td></tr>
            )}
            {sorted.map((c, i) => (
              <tr key={c.id} className={`row${i % 2 === 0 ? " even" : ""}`}>
                <td className="td name">{c.name}</td>
                <td className="td center"><IndexBar value={c.meetingIndex} /></td>
                <td className="td center"><IndexBar value={c.salesIndex} /></td>
                <td className="td center">
                  <span className={`badge ${c.trendPositive ? "pos" : "neg"}`}>
                    {c.trendPositive ? "▲ Yes" : "▼ No"}
                  </span>
                </td>
                <td className="td mono right">€{c.totalAmount.toLocaleString("da-DK")}</td>
                <td className="td mono center">{c.totalCount}</td>
                <td className="td mono right">€{c.avgTicketSize.toLocaleString("da-DK")}</td>
                {showWeekly && Array.from({ length: 12 }, (_, i) => {
                  const w = c.weeklyResults.find(r => r.week === i + 1)
                  const total = w ? w.physical + w.teams + w.dinner + w.webinar : 0
                  return <td key={i} className="td mono center">{total > 0 ? <span className="wdot">{total}</span> : <span className="dim">–</span>}</td>
                })}
                <td className="td mono center">{c.effort.physical}</td>
                <td className="td mono center">{c.effort.teams}</td>
                <td className="td mono center">{c.effort.dinner}</td>
                <td className="td mono center">{c.effort.webinar}</td>
                <td className="td mono center">{c.convDurationAvg.toFixed(1)}m</td>
                <td className="td mono center">{(c.hitRate * 100).toFixed(1)}%</td>
                <td className={`td mono center ${c.leadsDifference >= 0 ? "green" : "red"}`}>
                  {c.leadsDifference >= 0 ? "+" : ""}{c.leadsDifference}
                </td>
                <td className="td mono center">{c.numberOfLeads.toLocaleString("da-DK")}</td>
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
>>>>>>> ce1cf44ee7ca734993132862c09ae7a47580f7cb
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
<<<<<<< HEAD
  )
}

function IndexBar({ value }: { value: number }) {
  const pct   = Math.min(value / 200, 1)
  const color = pct >= 0.75 ? "#4ade80" : pct >= 0.45 ? "#fbbf24" : "#f87171"
  return (
    <div className="ibar">
      <span className="ival">{value}</span>
      <div className="itrack"><div className="ifill" style={{ width: `${pct * 100}%`, background: color }} /></div>
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
>>>>>>> ce1cf44ee7ca734993132862c09ae7a47580f7cb
}
