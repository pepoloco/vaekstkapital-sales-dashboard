<<<<<<< HEAD
export interface WeeklyActivity {
  physical: number
  teams: number
  dinner: number
  webinar: number
}

export interface Consultant {
  id: string
  name: string
  meetingIndex: number
  salesIndex: number
  trendPositive: boolean        // last 4w > prior 8w
  // 12-week results
  totalAmount: number
  totalCount: number
  avgTicketSize: number
  weeklyResults: WeeklyResult[]
  // Effort last 4 weeks
  effort: WeeklyActivity
  // Metrics
  convDurationAvg: number       // months
  hitRate: number               // 0–1
  leadsDifference: number
  numberOfLeads: number
}

export interface WeeklyResult {
  week: number
  physical: number
  teams: number
  dinner: number
  webinar: number
  amount: number
  count: number
}

export interface DashboardData {
  consultants: Consultant[]
  lastUpdated: string
  periodStart: string
  periodEnd: string
=======
export interface WeeklyResult {
  week: number;
  physical: number;
  teams: number;
  dinner: number;
  webinar: number;
  amount: number;
  count: number;
}

export interface Consultant {
  id: string;
  name: string;
  meetingIndex: number;
  salesIndex: number;
  trendPositive: boolean;
  weeklyResults: WeeklyResult[];
  totalAmount: number;
  totalCount: number;
  avgTicketSize: number;
  effort: {
    physical: number;
    teams: number;
    dinner: number;
    webinar: number;
  };
  convDurationAvg: number;
  hitRate: number;
  leadsDifference: number;
  numberOfLeads: number;
}

export interface SalesDashboardData {
  consultants: Consultant[];
  lastUpdated: string;
  periodStart: string;
  periodEnd: string;
>>>>>>> ce1cf44ee7ca734993132862c09ae7a47580f7cb
}
