"use client";

import type { SkuReport, SkuRow } from "@/lib/types";
import { fmtCurrency, fmtInt, fmtNum2, fmtPct } from "@/lib/format";
import PivotTable, { type FrozenColumn } from "./PivotTable";

const frozen: FrozenColumn<SkuRow>[] = [
  { key: "rank", header: "#", width: 44, align: "right", render: (r) => r.ranking },
  {
    key: "name",
    header: "Product Name",
    width: 240,
    render: (r) => (
      <span title={r.skuId} className="block truncate">
        {r.productName}
      </span>
    ),
  },
  { key: "mrp", header: "MRP", width: 70, align: "right", render: (r) => fmtCurrency(r.mrp) },
  { key: "mix", header: "Mix %", width: 70, align: "right", render: (r) => fmtPct(r.salesMix) },
  {
    key: "total",
    header: "Grand Total",
    width: 90,
    align: "right",
    render: (r) => <b>{fmtInt(r.grandTotal)}</b>,
  },
  { key: "avg", header: "Daily Avg", width: 80, align: "right", render: (r) => fmtNum2(r.dailyAvg) },
];

const placeholders = [
  { key: "backend", header: "Backend Stock", width: 70 },
  { key: "frontend", header: "Frontend Stock", width: 70 },
  { key: "po", header: "Open PO", width: 60 },
  { key: "soh", header: "Total SOH", width: 60 },
  { key: "cover", header: "SOH Cover", width: 60 },
];

export default function SkuReportTable({ data }: { data: SkuReport }) {
  return (
    <PivotTable<SkuRow>
      frozen={frozen}
      days={data.days}
      rows={data.rows}
      rowKey={(r) => r.skuId}
      placeholders={placeholders}
      cell={(r, dk) => {
        const v = r.daily[dk] ?? 0;
        return v === 0 ? <span className="text-gray-300">0</span> : fmtInt(v);
      }}
    />
  );
}
