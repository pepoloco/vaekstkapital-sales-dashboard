"use client"
import { useEffect } from "react"

interface Props {
  ids: string[]
  label: string
  portalId: string
  hubDomain: string
  onClose: () => void
}

export default function MeetingsModal({ ids, label, portalId, hubDomain, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-hd">
          <span className="modal-ttl">{label}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {ids.map((id, i) => (
            <a
              key={id}
              className="modal-link"
              href={`https://${hubDomain}/contacts/${portalId}/objects/0-47/${id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="modal-link-num">#{i + 1}</span>
              <span>Åbn i HubSpot →</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
