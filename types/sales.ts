export interface WeeklyResult {
  week: number
  physical: number
  teams: number
  dinner: number
  webinar: number
  amount: number
  count: number
  meetingIds: string[]
}

export interface MeetingOutcomes {
  scheduled:           number  // SCHEDULED
  completed:           number  // COMPLETED
  rescheduled:         number  // RESCHEDULED
  noShow:              number  // NO_SHOW
  cancelled:           number  // CANCELED
  expectedWithin3:     number  // EXPECTED_INVESTMENT_WITHIN_3*
  expectedWithin6:     number  // EXPECTED_INVESTMENT_WITHIN_6*
  noInterest:          number  // THE_CUSTOMER_HAS_NO_INTEREST
  disqualifiedMeeting: number  // DISQUALIFIED_MEETING
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
  portalId: string
  hubDomain: string
}
