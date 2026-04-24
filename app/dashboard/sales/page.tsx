import KpiCards from "@/components/sales/KpiCards"
import SalesTable from "@/components/sales/SalesTable"
import { DashboardData } from "@/types/sales"

async function getData(): Promise<DashboardData> {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const res  = await fetch(`${base}/api/hubspot/sales`, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export default async function SalesDashboardPage() {
  let data: DashboardData
  let error: string | null = null

  try {
    data = await getData()
  } catch (e: any) {
    error = e.message
    data  = { consultants: [], lastUpdated: new Date().toISOString(), periodStart: "", periodEnd: "" }
  }

  const period = data.periodStart
    ? `${new Date(data.periodStart).toLocaleDateString("da-DK", { day: "numeric", month: "short" })} – ${new Date(data.periodEnd).toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" })}`
    : "Last 12 weeks"

  return (
    <main className="page">
      <header className="header">
        <div className="header-left">
          <div className="logo">VK</div>
          <div>
            <h1 className="title">Sales Activity</h1>
            <p className="subtitle">Vaekstkapital · {period}</p>
          </div>
        </div>
        <div className="header-right">
          <span className="live"><span className="dot" />Live</span>
          <span className="updated">
            Updated {new Date(data.lastUpdated).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </header>

      {error && <div className="error-bar">⚠ HubSpot error: {error}</div>}

      <div className="section"><KpiCards consultants={data.consultants} /></div>
      <div className="section"><SalesTable consultants={data.consultants} /></div>
    </main>
  )
}
