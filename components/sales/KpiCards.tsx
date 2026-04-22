"use client";
import { Consultant } from "@/types/sales";

interface KpiCardsProps {
  consultants: Consultant[];
}

export default function KpiCards({ consultants }: KpiCardsProps) {
  const totalRevenue = consultants.reduce((s, c) => s + c.totalAmount, 0);
  const totalDeals = consultants.reduce((s, c) => s + c.totalCount, 0);
  const avgHitRate =
    consultants.length > 0
      ? consultants.reduce((s, c) => s + c.hitRate, 0) / consultants.length
      : 0;
  const trending = consultants.filter((c) => c.trendPositive).length;
  const avgMeetingIndex =
    consultants.length > 0
      ? Math.round(consultants.reduce((s, c) => s + c.meetingIndex, 0) / consultants.length)
      : 0;
  const avgSalesIndex =
    consultants.length > 0
      ? Math.round(consultants.reduce((s, c) => s + c.salesIndex, 0) / consultants.length)
      : 0;

  const cards = [
    {
      label: "Total Revenue",
      sub: "12 weeks",
      value: `€${totalRevenue.toLocaleString("da-DK")}`,
      accent: "#4ade80",
      icon: "◈",
    },
    {
      label: "Deals Closed",
      sub: "12 weeks",
      value: totalDeals,
      accent: "#60a5fa",
      icon: "◉",
    },
    {
      label: "Avg Hit Rate",
      sub: "all consultants",
      value: `${(avgHitRate * 100).toFixed(1)}%`,
      accent: "#a78bfa",
      icon: "◎",
    },
    {
      label: "Trending Up",
      sub: "last 4 vs prior 8w",
      value: `${trending} / ${consultants.length}`,
      accent: "#fb923c",
      icon: "△",
    },
    {
      label: "Avg Meeting Index",
      sub: "team average",
      value: avgMeetingIndex,
      accent: "#f472b6",
      icon: "◇",
    },
    {
      label: "Avg Sales Index",
      sub: "team average",
      value: avgSalesIndex,
      accent: "#34d399",
      icon: "◈",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="kpi-card"
          style={{ "--accent": card.accent } as React.CSSProperties}
        >
          <div className="kpi-icon">{card.icon}</div>
          <div className="kpi-value">{card.value}</div>
          <div className="kpi-label">{card.label}</div>
          <div className="kpi-sub">{card.sub}</div>
        </div>
      ))}
    </div>
  );
}
