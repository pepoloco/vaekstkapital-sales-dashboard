"use client"
import { useState } from "react"

export default function SyncButton() {
  const [syncing, setSyncing] = useState(false)

  async function handleSync() {
    setSyncing(true)
    try {
      await fetch("/api/hubspot/sync")
    } finally {
      window.location.reload()
    }
  }

  return (
    <button className="hdr-sync" disabled={syncing} onClick={handleSync}>
      {syncing ? "Synkroniserer…" : "↺ Synkronisér"}
    </button>
  )
}
