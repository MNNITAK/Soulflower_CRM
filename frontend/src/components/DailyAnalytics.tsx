"use client";

import type { DailyReport } from "@/lib/types";
import { fmtInt, fmtCurrency, fmtNum2, fmtPct } from "@/lib/format";
import { ChartCard, KpiCard, TrendChart } from "./charts";

export default function DailyAnalytics({ data }: { data: DailyReport }) {
  const cur = data.totals.current;
  const prior = data.totals.prior;
  const days = data.rows.length || 1;
  const growth =
    prior && prior.qty > 0 ? (cur.qty - prior.qty) / prior.qty : null;

  const trend = data.rows.map((r) => ({
    label: String(r.dayOfMonth),
    value: r.current.qty,
    compare: r.prior?.qty,
    title: `${r.date} (${r.dow}): ${fmtInt(r.current.qty)}${
      r.prior ? ` vs ${fmtInt(r.prior.qty)} prior` : ""
    }`,
  }));

  return (
    <div className="mb-4 space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Total Qty" value={fmtInt(cur.qty)} />
        <KpiCard label="Total MRP Value" value={fmtCurrency(cur.mrpValue)} />
        <KpiCard label="Avg Qty / Day" value={fmtNum2(cur.qty / days)} />
        <KpiCard
          label="Growth vs Prior"
          value={growth == null ? "—" : fmtPct(growth)}
          sub={prior ? `prior: ${fmtInt(prior.qty)}` : undefined}
          tone={growth == null ? "default" : growth >= 0 ? "up" : "down"}
        />
      </div>
      <ChartCard title="Daily Quantity Trend (bars = current · dashed = prior period)">
        <TrendChart data={trend} />
      </ChartCard>
    </div>
  );
}
