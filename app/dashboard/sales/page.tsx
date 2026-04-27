import SalesDashboardClient from "@/components/sales/SalesDashboardClient"

export default function Page() {
  return (
    <div className="page">
      <header className="hdr">
        <div className="hl">
          <div className="logo-mark">VK</div>
          <span className="logo-name">Vaekstkapital</span>
        </div>
        <div className="hr">
          <a href="/dashboard/sales" className="hdr-sync">↺ Synkronisér</a>
        </div>
      </header>
      <main className="content">
        <div className="page-hd">
          <h1 className="ttl">Sales Activity</h1>
          <p className="sub">Vaekstkapital Group — konsulentperformance, ekskl. testbrugere</p>
        </div>
        <SalesDashboardClient />
      </main>
    </div>
  )
}
