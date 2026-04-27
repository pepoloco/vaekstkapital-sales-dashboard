"use client"
import { useState, useEffect } from "react"
import KpiCards from "./KpiCards"
import SalesTable from "./SalesTable"
import MeetingsModal from "./MeetingsModal"
import { DashboardData, MeetingRef } from "@/types/sales"

export default function DashboardLayout() {
  const [data, setData]       = useState<DashboardData | null>(null)
  const [error, setError]     = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [modal, setModal]     = useState<{ meetings: MeetingRef[]; label: string } | null>(null)

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/login"
  }

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch("/api/hubspot/sales")
      const text = await res.text()
      if (!res.ok) {
        setError(`Server fejl ${res.status} — prøv at klikke Synkronisér`)
        return
      }
      let d: any
      try { d = JSON.parse(text) } catch {
        setError("Uventet svar fra serveren — prøv at klikke Synkronisér")
        return
      }
      if (d.error) setError(d.error)
      else setData(d)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSync() {
    setSyncing(true)
    try {
      await fetch("/api/hubspot/sync")
      await loadData()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const updStr = data ? fmt(new Date(data.lastUpdated)) : null

  const period = data?.periodStart
    ? `${new Date(data.periodStart).toLocaleDateString("da-DK", { day: "numeric", month: "short" })} – ${new Date(data.periodEnd).toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" })}`
    : null

  return (
    <div className="page">
      <header className="hdr">
        <div className="hl">
          <div className="logo-mark">VK</div>
          <span className="logo-name">Vaekstkapital</span>
        </div>
        <div className="hr">
          {updStr && <span className="hdr-upd">Opdateret {updStr}</span>}
          <button className="hdr-sync" disabled={syncing} onClick={handleSync}>
            {syncing ? "Synkroniserer…" : "↺ Synkronisér"}
          </button>
          <button className="hdr-logout" onClick={handleLogout} title="Log ud">
            ⏻
          </button>
        </div>
      </header>
      <main className="content">
        <div className="page-hd">
          <h1 className="ttl">Sales Activity</h1>
          <p className="sub">Vaekstkapital Group — Team Denmark</p>
          {period && <p className="sub-meta">{period}</p>}
        </div>
        {loading && (
          <div className="loading-wrap">
            <div className="spinner" />
            <p className="loading-txt">Henter data fra HubSpot…</p>
          </div>
        )}
        {!loading && error && <div className="err">⚠ HubSpot fejl: {error}</div>}
        {!loading && !error && data && (
          <>
            <div className="sec">
              <KpiCards
                consultants={data.consultants}
                portalId={data.portalId}
                hubDomain={data.hubDomain}
                onOpenModal={(meetings, label) => setModal({ meetings, label })}
              />
            </div>
            <div className="sec">
              <SalesTable
                consultants={data.consultants}
                portalId={data.portalId}
                hubDomain={data.hubDomain}
                onOpenModal={(meetings, label) => setModal({ meetings, label })}
              />
            </div>
          </>
        )}
      </main>
      {modal && data && (
        <MeetingsModal
          meetings={modal.meetings}
          label={modal.label}
          portalId={data.portalId}
          hubDomain={data.hubDomain}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}

function fmt(d: Date): string {
  return `${d.toLocaleDateString("da-DK", { day: "numeric", month: "numeric", year: "numeric" })}, ${d.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" })}`
}
