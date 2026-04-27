export interface WeeklyResult {
  week: number
  physical: number
  teams: number
  dinner: number
  webinar: number
  amount: number
  count: number
}

export interface MeetingOutcomes {
  completed:  number
  noShow:     number
  cancelled:  number
  scheduled:  number  // booked but no outcome yet (future/pending)
}

export interface Consultant {
  id: string
  name: string
  meetingIndex: number
  salesIndex: number
  trendPositive: boolean
  totalAmount: number
  totalCount: number
  avgTicketSize: number
  weeklyResults: WeeklyResult[]
  effort: { physical: number; teams: number; dinner: number; webinar: number }
  outcomes: MeetingOutcomes
  convDurationAvg: number
  hitRate: number
  leadsDifference: number
  numberOfLeads: number
}

export interface DashboardData {
  consultants: Consultant[]
  lastUpdated: string
  periodStart: string
  periodEnd: string
}
