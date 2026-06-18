"use client";

import type { CityReport } from "@/lib/types";
import { fmtInt } from "@/lib/format";
import { ChartCard, KpiCard, RankBars, Donut } from "./charts";

export default function CityAnalytics({ data }: { data: CityReport }) {
  const top = data.rows[0];

  const topBars = data.rows.slice(0, 10).map((r) => ({
    label: r.cityName,
    value: r.grandTotal,
  }));

  // region distribution across the returned (top) cities
  const byRegion = new Map<string, number>();
  for (const r of data.rows) {
    const k = r.region || "Unknown";
    byRegion.set(k, (byRegion.get(k) ?? 0) + r.grandTotal);
  }
  const regionData = [...byRegion.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="mb-4 space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Total Qty" value={fmtInt(data.grandTotalQty)} />
        <KpiCard label="Cities (shown)" value={fmtInt(data.rows.length)} />
        <KpiCard
          label="Top City"
          value={top ? fmtInt(top.grandTotal) : "—"}
          sub={top ? `${top.cityName} · ${top.region}` : undefined}
        />
        <KpiCard label="Regions" value={fmtInt(regionData.length)} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Top 10 Cities by Quantity">
          <RankBars data={topBars} valueFmt={fmtInt} />
        </ChartCard>
        <ChartCard title="Quantity by Region (top cities)">
          <Donut data={regionData} valueFmt={fmtInt} />
        </ChartCard>
      </div>
    </div>
  );
}
