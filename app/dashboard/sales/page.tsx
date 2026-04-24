<<<<<<< HEAD
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
=======
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import KpiCards from "@/components/sales/KpiCards";
import SalesTable from "@/components/sales/SalesTable";
import { SalesDashboardData } from "@/types/sales";

async function getSalesData(): Promise<SalesDashboardData> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/hubspot/sales`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to fetch sales data");
  return res.json();
}

export default async function SalesDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");

  let data: SalesDashboardData;
  let error: string | null = null;

  try {
    data = await getSalesData();
  } catch (e: any) {
    error = e.message;
    data = { consultants: [], lastUpdated: new Date().toISOString(), periodStart: "", periodEnd: "" };
  }

  const periodLabel =
    data.periodStart && data.periodEnd
      ? `${new Date(data.periodStart).toLocaleDateString("da-DK", { day: "numeric", month: "short" })} – ${new Date(data.periodEnd).toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" })}`
      : "Last 12 weeks";

  return (
    <main className="page">
      {/* Header */}
      <header className="page-header">
        <div className="header-left">
          <div className="logo-mark">VK</div>
          <div>
            <h1 className="page-title">Sales Activity</h1>
            <p className="page-sub">Vaekstkapital · {periodLabel}</p>
          </div>
        </div>
        <div className="header-right">
          <div className="last-updated">
            <span className="pulse-dot" />
            Updated {new Date(data.lastUpdated).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div className="user-badge">{(session as any).user?.name?.charAt(0) ?? "U"}</div>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="error-banner">
          ⚠ Could not load HubSpot data: {error}
        </div>
      )}

      {/* KPI strip */}
      <section className="section">
        <KpiCards consultants={data.consultants} />
      </section>

      {/* Table */}
      <section className="section">
        <SalesTable consultants={data.consultants} periodStart={data.periodStart} />
      </section>
    </main>
  );
>>>>>>> ce1cf44ee7ca734993132862c09ae7a47580f7cb
}
