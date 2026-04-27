import KpiCards from "@/components/sales/KpiCards"
import SalesTable from "@/components/sales/SalesTable"
import { fetchDashboardData } from "@/lib/hubspot/data"

export const revalidate = 3600

export default async function Page() {
  let data
  let error: string | null = null
  try {
    data = await fetchDashboardData()
  } catch (e: any) {
    error = e.message
    data  = { consultants: [], lastUpdated: new Date().toISOString(), periodStart: "", periodEnd: "" }
  }

  const period = data.periodStart
    ? `${new Date(data.periodStart).toLocaleDateString("da-DK", { day: "numeric", month: "short" })} – ${new Date(data.periodEnd).toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" })}`
    : "Seneste 12 uger"

  const upd    = new Date(data.lastUpdated)
  const updStr = `${upd.toLocaleDateString("da-DK", { day: "numeric", month: "numeric", year: "numeric" })}, ${upd.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`

  return (
    <div className="page">
      <header className="hdr">
        <div className="hl">
          <div className="logo-mark">VK</div>
          <span className="logo-name">Vaekstkapital</span>
        </div>
        <div className="hr">
          <span className="hdr-upd">Opdateret {updStr}</span>
          <a href="/dashboard/sales" className="hdr-sync">↺ Synkronisér</a>
        </div>
      </header>
      <main className="content">
        <div className="page-hd">
          <h1 className="ttl">Sales Activity</h1>
          <p className="sub">Vaekstkapital Group — konsulentperformance, ekskl. testbrugere</p>
          <p className="sub-meta">{period}</p>
        </div>
        {error && <div className="err">⚠ HubSpot fejl: {error}</div>}
        <div className="sec"><KpiCards consultants={data.consultants} /></div>
        <div className="sec"><SalesTable consultants={data.consultants} /></div>
      </main>
    </div>
  )
}
