import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchDealsByOwner, fetchOwners, fetchLeadsByOwner } from "@/lib/hubspot/deals";
import { fetchMeetingsByOwner, classifyMeetingType } from "@/lib/hubspot/activities";
import { calcMeetingIndex, calcSalesIndex, calcTrend, getWeekNumber } from "@/lib/hubspot/metrics";
import { Consultant, SalesDashboardData, WeeklyResult } from "@/types/sales";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [owners, deals] = await Promise.all([
      fetchOwners(),
      fetchDealsByOwner(12),
    ]);

    const now = new Date();
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - 12 * 7);
    const startWeek = getWeekNumber(periodStart);

    const consultants: Consultant[] = await Promise.all(
      owners.map(async (owner: any) => {
        const ownerId = owner.id;
        const ownerName = `${owner.firstName} ${owner.lastName}`.trim();

        const [meetings, leads] = await Promise.all([
          fetchMeetingsByOwner(ownerId, 12),
          fetchLeadsByOwner(ownerId),
        ]);

        // Build weekly buckets W1–W12
        const weeklyMap: Record<number, WeeklyResult> = {};
        for (let w = 1; w <= 12; w++) {
          weeklyMap[w] = { week: w, physical: 0, teams: 0, dinner: 0, webinar: 0, amount: 0, count: 0 };
        }

        // Distribute meetings into weeks
        meetings.forEach((m: any) => {
          const props = m.properties;
          const startTime = props.hs_meeting_start_time;
          if (!startTime) return;
          const date = new Date(parseInt(startTime));
          const absWeek = getWeekNumber(date);
          const relWeek = Math.max(1, Math.min(12, absWeek - startWeek + 1));
          const type = classifyMeetingType(
            props.hs_meeting_title || "",
            props.hs_internal_meeting_notes || ""
          );
          if (weeklyMap[relWeek]) weeklyMap[relWeek][type]++;
        });

        // Distribute deals into weeks
        const ownerDeals = deals.filter(
          (d: any) => d.properties.hubspot_owner_id === ownerId
        );

        let totalAmount = 0;
        let totalDuration = 0;

        ownerDeals.forEach((d: any) => {
          const amount = parseFloat(d.properties.amount || "0");
          totalAmount += amount;
          const created = new Date(d.properties.createdate);
          const closed = new Date(d.properties.closedate);
          totalDuration += (closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 30);
          const absWeek = getWeekNumber(closed);
          const relWeek = Math.max(1, Math.min(12, absWeek - startWeek + 1));
          if (weeklyMap[relWeek]) {
            weeklyMap[relWeek].amount += amount;
            weeklyMap[relWeek].count++;
          }
        });

        const totalCount = ownerDeals.length;
        const weeklyResults = Object.values(weeklyMap);

        // Effort = weeks 9–12 (last 4 weeks)
        const effort = weeklyResults
          .filter((w) => w.week >= 9)
          .reduce(
            (acc, w) => ({
              physical: acc.physical + w.physical,
              teams: acc.teams + w.teams,
              dinner: acc.dinner + w.dinner,
              webinar: acc.webinar + w.webinar,
            }),
            { physical: 0, teams: 0, dinner: 0, webinar: 0 }
          );

        // Leads delta: leads created in last 4 weeks vs prior 4 weeks
        const fourWeeksAgo = new Date();
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
        const eightWeeksAgo = new Date();
        eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

        const recentLeads = leads.filter((l: any) => new Date(l.properties.createdate) >= fourWeeksAgo).length;
        const priorLeads = leads.filter((l: any) => {
          const d = new Date(l.properties.createdate);
          return d >= eightWeeksAgo && d < fourWeeksAgo;
        }).length;

        return {
          id: ownerId,
          name: ownerName || "Unknown",
          meetingIndex: calcMeetingIndex(weeklyResults),
          salesIndex: calcSalesIndex(totalAmount),
          trendPositive: calcTrend(weeklyResults),
          weeklyResults,
          totalAmount,
          totalCount,
          avgTicketSize: totalCount > 0 ? totalAmount / totalCount : 0,
          effort,
          convDurationAvg: totalCount > 0 ? totalDuration / totalCount : 0,
          hitRate: meetings.length > 0 ? totalCount / meetings.length : 0,
          leadsDifference: recentLeads - priorLeads,
          numberOfLeads: leads.length,
        } as Consultant;
      })
    );

    const response: SalesDashboardData = {
      consultants,
      lastUpdated: new Date().toISOString(),
      periodStart: periodStart.toISOString(),
      periodEnd: now.toISOString(),
    };

    return NextResponse.json(response);
  } catch (err: any) {
    console.error("[HubSpot Sales API]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
