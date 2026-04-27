"use client"
import { useEffect } from "react"
import { MeetingRef } from "@/types/sales"

interface Props {
  meetings: MeetingRef[]
  label: string
  portalId: string
  hubDomain: string
  onClose: () => void
}

function fmtDate(ts: number): string {
  if (!ts) return ""
  return new Date(ts).toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" })
}

export default function MeetingsModal({ meetings, label, portalId, hubDomain, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  // Sort by startTime descending (newest first)
  const sorted = [...meetings].sort((a, b) => b.startTime - a.startTime)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-hd">
          <span className="modal-ttl">{label}</span>
          <span className="modal-count">{meetings.length} møde{meetings.length !== 1 ? "r" : ""}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {sorted.map((ref, i) => {
            const href = ref.companyId && portalId
              ? `https://${hubDomain}/contacts/${portalId}/record/0-2/${ref.companyId}/view/1?engagement=${ref.id}`
              : portalId
                ? `https://${hubDomain}/contacts/${portalId}/objects/0-47/views/all/list`
                : null
            return href ? (
              <a
                key={ref.id}
                className="modal-link"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="modal-link-num">#{i + 1}</span>
                <div className="modal-link-body">
                  <span className="modal-link-title">{ref.title}</span>
                  {ref.startTime > 0 && <span className="modal-link-date">{fmtDate(ref.startTime)}</span>}
                </div>
                <span className="modal-link-arrow">↗</span>
              </a>
            ) : (
              <div key={ref.id} className="modal-link modal-link-nourl">
                <span className="modal-link-num">#{i + 1}</span>
                <div className="modal-link-body">
                  <span className="modal-link-title">{ref.title}</span>
                  {ref.startTime > 0 && <span className="modal-link-date">{fmtDate(ref.startTime)}</span>}
                </div>
              </div>
            )
          })}
          {sorted.length === 0 && (
            <p style={{ color: "var(--muted)", textAlign: "center", padding: "16px 0" }}>Ingen møder fundet</p>
          )}
        </div>
        {!portalId && (
          <p className="modal-warn">Sæt HUBSPOT_PORTAL_ID i Vercel for at aktivere direkte links.</p>
        )}
      </div>
    </div>
  )
}
