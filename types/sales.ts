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
}
