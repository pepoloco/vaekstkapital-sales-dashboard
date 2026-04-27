"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res  = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Fejl ved login")
      } else {
        router.push("/dashboard/sales")
        router.refresh()
      }
    } catch {
      setError("Netværksfejl — prøv igen")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-logo-wrap">
          <div className="login-logo-mark">❋</div>
          <div className="login-logo-name">
            <span>VAEKST</span>
            <span>KAPITAL</span>
          </div>
        </div>
        <p className="login-sub">LEAD DASHBOARD — INTERN ADGANG</p>
        <h1 className="login-ttl">Log ind</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label className="login-lbl">EMAIL</label>
            <input
              type="email"
              className="login-inp"
              placeholder="navn@vaekstkapital.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="login-field">
            <label className="login-lbl">ADGANGSKODE</label>
            <input
              type="password"
              className="login-inp"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="login-err">{error}</p>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logger ind…" : "Log ind"}
          </button>
        </form>
      </div>
    </div>
  )
}
