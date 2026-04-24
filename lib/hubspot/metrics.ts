import { WeeklyResult } from "@/types/sales"

export function calcMeetingIndex(weekly: WeeklyResult[], teamAvg: number): number {
  const total = weekly.reduce((s, w) => s + w.physical + w.teams + w.dinner + w.webinar, 0)
  if (teamAvg === 0) return total > 0 ? 200 : 0
  return Math.min(Math.round((total / teamAvg) * 100), 999)
}

export function calcSalesIndex(amount: number, teamAvg: number): number {
  if (teamAvg === 0) return amount > 0 ? 200 : 0
  return Math.min(Math.round((amount / teamAvg) * 100), 999)
}

export function calcTrend(weekly: WeeklyResult[]): boolean {
  const sorted = [...weekly].sort((a, b) => b.week - a.week)
  const last4  = sorted.slice(0, 4)
  const prior8 = sorted.slice(4, 12)
  if (prior8.length === 0) return false
  const avg4 = last4.reduce((s, w)  => s + w.physical + w.teams + w.dinner + w.webinar, 0) / 4
  const avg8 = prior8.reduce((s, w) => s + w.physical + w.teams + w.dinner + w.webinar, 0) / 8
  return avg4 > avg8
}

export function getWeekNumber(date: Date): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const w1 = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d.getTime() - w1.getTime()) / 86400000 - 3 + ((w1.getDay() + 6) % 7)) / 7)
}

export function classifyMeeting(title: string, notes: string): "physical" | "teams" | "dinner" | "webinar" {
  const t = (title + " " + notes).toLowerCase()
  if (t.includes("dinner") || t.includes("lunch"))                                              return "dinner"
  if (t.includes("webinar") || t.includes("seminar"))                                           return "webinar"
  if (t.includes("teams") || t.includes("zoom") || t.includes("video") || t.includes("online")) return "teams"
  return "physical"
}
