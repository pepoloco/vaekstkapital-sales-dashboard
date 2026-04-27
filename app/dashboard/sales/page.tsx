import SalesDashboardClient from "@/components/sales/SalesDashboardClient"
import SyncButton from "@/components/sales/SyncButton"

export default function Page() {
  return (
    <div className="page">
      <header className="hdr">
        <div className="hl">
          <div className="logo-mark">VK</div>
          <span className="logo-name">Vaekstkapital</span>
        </div>
        <div className="hr">
          <SyncButton />
        </div>
      </header>
      <main className="content">
        <div className="page-hd">
          <h1 className="ttl">Sales Activity</h1>
          <p className="sub">Vaekstkapital Group — Team Denmark, ekskl. testbrugere</p>
        </div>
        <SalesDashboardClient />
      </main>
    </div>
  )
}
