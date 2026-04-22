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
}
