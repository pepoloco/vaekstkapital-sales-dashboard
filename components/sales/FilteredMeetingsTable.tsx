"use client"
import { useState } from "react"
import { Consultant } from "@/types/sales"

interface Row {
  userId: string; name: string; total: number
  physical: number; teams: number; dinner: number; webinar: number
  scheduled: number; completed: number; rescheduled: number; noShow: number
  cancelled: number; expectedWithin3: number; expectedWithin6: number
  noInterest: number; disqualifiedMeeting: number
}

interface Props { consultants: Consultant[] }

function today(): string { return new Date().toISOString().slice(0, 10) }
function daysAgo(n: number): string { return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10) }

function Cell({ n, color }: { n: number; color?: string }) {
  if (n === 0) return <span className="dm">–</span>
  return <span style={color ? { color, fontWeight: 500 } : undefined}>{n}</span>
}

export default function FilteredMeetingsTable({ consultants }: Props) {
  const [from,    setFrom]    = useState(daysAgo(365))
  const [to,      setTo]      = useState(today())
  const [ownerId, setOwnerId] = useState("")
  const [rows,    setRows]    = useState<Row[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleFetch() {
    setLoading(true)
    setError(null)
    try {
      const p = new URLSearchParams({ from, to })
      if (ownerId) p.set("ownerId", ownerId)
      const res  = await fetch(`/api/hubspot/meetings?${p}`)
      const data = await res.json()
      if (data.error) setError(data.error)
      else            setRows(data.results)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const validConsultants = consultants.filter(c => c.userId)

  return (
    <div className="tw">
      <div className="bar" style={{ flexWrap: "wrap", gap: 10 }}>
        <span className="sec-ttl">Møder — tilpasset filter</span>
        <div className="bar-r" style={{ flexWrap: "wrap", gap: 8 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--tx2)" }}>
            Fra
            <input
              type="date" value={from} onChange={e => setFrom(e.target.value)}
              className="srch" style={{ width: 140 }}
            />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--tx2)" }}>
            Til
            <input
              type="date" value={to} onChange={e => setTo(e.target.value)}
              className="srch" style={{ width: 140 }}
            />
          </label>
          <select
            value={ownerId} onChange={e => setOwnerId(e.target.value)}
            className="srch" style={{ width: 180 }}
          >
            <option value="">Alle konsulenter</option>
            {validConsultants.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button className="hdr-sync" disabled={loading} onClick={handleFetch} style={{ fontSize: 12 }}>
            {loading ? "Henter…" : "Hent data"}
          </button>
        </div>
      </div>

      {error && <div className="err" style={{ margin: "12px 16px" }}>⚠ {error}</div>}

      {rows !== null && (
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th className="tg" colSpan={5}>Mødetyper</th>
                <th className="tg" colSpan={9}>Mødeudbytte</th>
              </tr>
              <tr>
                <th className="th" style={{ minWidth: 160 }}>Konsulent</th>
                <th className="th c">Total</th>
                <th className="th c">Fysisk</th>
                <th className="th c">Teams</th>
                <th className="th c">Middag</th>
                <th className="th c">Webinar</th>
                <th className="th c">Planlagt</th>
                <th className="th c">Gennemført</th>
                <th className="th c">Genplaceret</th>
                <th className="th c">No Show</th>
                <th className="th c">Aflyst</th>
                <th className="th c">Inv. 3m</th>
                <th className="th c">Inv. 6m</th>
                <th className="th c">Ingen int.</th>
                <th className="th c">Diskvalif.</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={15} className="empty">Ingen møder fundet i den valgte periode</td></tr>
              )}
              {rows.map((r, i) => (
                <tr key={r.userId} className={`row${i % 2 === 0 ? " even" : ""}`}>
                  <td className="td nm">{r.name}</td>
                  <td className="td mn c" style={{ fontWeight: 600 }}>{r.total}</td>
                  <td className="td mn c"><Cell n={r.physical} /></td>
                  <td className="td mn c"><Cell n={r.teams} /></td>
                  <td className="td mn c"><Cell n={r.dinner} /></td>
                  <td className="td mn c"><Cell n={r.webinar} /></td>
                  <td className="td mn c"><Cell n={r.scheduled} /></td>
                  <td className="td mn c"><Cell n={r.completed} color="var(--gn)" /></td>
                  <td className="td mn c"><Cell n={r.rescheduled} /></td>
                  <td className="td mn c"><Cell n={r.noShow} color="var(--rd)" /></td>
                  <td className="td mn c"><Cell n={r.cancelled} color="var(--am)" /></td>
                  <td className="td mn c"><Cell n={r.expectedWithin3} color="#0ea5e9" /></td>
                  <td className="td mn c"><Cell n={r.expectedWithin6} color="#0ea5e9" /></td>
                  <td className="td mn c"><Cell n={r.noInterest} /></td>
                  <td className="td mn c"><Cell n={r.disqualifiedMeeting} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rows === null && !loading && (
        <div className="empty">Vælg periode og klik "Hent data" for at se møder</div>
      )}
    </div>
  )
}
