<<<<<<< HEAD
import { WeeklyResult } from "@/types/sales"

// Meeting index: weighted score vs team average (100 = average, 200 = 2x average)
export function calcMeetingIndex(weekly: WeeklyResult[], teamAvgMeetings: number): number {
  const total = weekly.reduce((s, w) => s + w.physical + w.teams + w.dinner + w.webinar, 0)
  if (teamAvgMeetings === 0) return total > 0 ? 200 : 0
  return Math.min(Math.round((total / teamAvgMeetings) * 100), 999)
}

// Sales index: this consultant's amount vs team average amount (100 = average)
export function calcSalesIndex(amount: number, teamAvgAmount: number): number {
  if (teamAvgAmount === 0) return amount > 0 ? 200 : 0
  return Math.min(Math.round((amount / teamAvgAmount) * 100), 999)
}

// True if avg activity last 4w > avg activity in prior 8w
export function calcTrend(weekly: WeeklyResult[]): boolean {
  const sorted = [...weekly].sort((a, b) => b.week - a.week)
  const last4 = sorted.slice(0, 4)
  const prior8 = sorted.slice(4, 12)
  if (prior8.length === 0) return false
  const avg4 = last4.reduce((s, w) => s + w.physical + w.teams + w.dinner + w.webinar, 0) / 4
  const avg8 = prior8.reduce((s, w) => s + w.physical + w.teams + w.dinner + w.webinar, 0) / 8
  return avg4 > avg8
=======
import { WeeklyResult } from "@/types/sales";

// Weighted meeting score — adjust weights to your formula
// Physical = 3pts, Dinner = 3pts, Teams = 1pt, Webinar = 1pt
export function calcMeetingIndex(weekly: WeeklyResult[]): number {
  const total = weekly.reduce((sum, w) => {
    return sum + w.physical * 3 + w.dinner * 3 + w.teams * 1 + w.webinar * 1;
  }, 0);
  return Math.round(Math.min((total / 120) * 200, 200));
}

// Sales index vs quarterly target — adjust target to your own
export function calcSalesIndex(totalAmount: number, target = 36000): number {
  return Math.round(Math.min((totalAmount / target) * 200, 200));
}

// True if avg meetings in last 4w > avg meetings in prior 8w
export function calcTrend(weekly: WeeklyResult[]): boolean {
  const sorted = [...weekly].sort((a, b) => b.week - a.week);
  const last4 = sorted.slice(0, 4);
  const prior8 = sorted.slice(4, 12);
  if (prior8.length === 0) return false;

  const avg4 =
    last4.reduce((s, w) => s + w.physical + w.teams + w.dinner + w.webinar, 0) / 4;
  const avg8 =
    prior8.reduce((s, w) => s + w.physical + w.teams + w.dinner + w.webinar, 0) / 8;

  return avg4 > avg8;
>>>>>>> ce1cf44ee7ca734993132862c09ae7a47580f7cb
}

// ISO week number
export function getWeekNumber(date: Date): number {
<<<<<<< HEAD
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
=======
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
>>>>>>> ce1cf44ee7ca734993132862c09ae7a47580f7cb
}
