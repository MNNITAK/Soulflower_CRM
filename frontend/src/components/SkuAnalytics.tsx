"use client";

import type { SkuReport } from "@/lib/types";
import { fmtInt, fmtPct } from "@/lib/format";
import { ChartCard, KpiCard, RankBars } from "./charts";

export default function SkuAnalytics({ data }: { data: SkuReport }) {
  const top = data.rows[0];
  const topBars = data.rows.slice(0, 10).map((r) => ({
    label: r.productName,
    value: r.grandTotal,
  }));
  const top10Share =
    data.grandTotalQty > 0
      ? data.rows.slice(0, 10).reduce((a, r) => a + r.grandTotal, 0) /
        data.grandTotalQty
      : 0;

  return (
    <div className="mb-4 space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Total Qty" value={fmtInt(data.grandTotalQty)} />
        <KpiCard label="Active SKUs" value={fmtInt(data.rows.length)} />
        <KpiCard
          label="Top SKU"
          value={top ? fmtInt(top.grandTotal) : "—"}
          sub={top?.productName}
        />
        <KpiCard label="Top 10 Share" value={fmtPct(top10Share)} />
      </div>
      <ChartCard title="Top 10 SKUs by Quantity">
        <RankBars data={topBars} valueFmt={fmtInt} />
      </ChartCard>
    </div>
  );
}
