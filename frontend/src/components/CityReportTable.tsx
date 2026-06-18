"use client";

import type { CityReport, CityRow } from "@/lib/types";
import { fmtInt, fmtNum2, fmtPct } from "@/lib/format";
import PivotTable, { type FrozenColumn } from "./PivotTable";

const frozen: FrozenColumn<CityRow>[] = [
  { key: "rank", header: "#", width: 44, align: "right", render: (r) => r.ranking },
  { key: "region", header: "Region", width: 80, render: (r) => r.region },
  {
    key: "city",
    header: "City",
    width: 170,
    render: (r) => <span className="block truncate">{r.cityName}</span>,
  },
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
  { key: "soh", header: "Total SOH", width: 60 },
  { key: "cover", header: "SOH Cover", width: 60 },
];

export default function CityReportTable({ data }: { data: CityReport }) {
  return (
    <PivotTable<CityRow>
      frozen={frozen}
      days={data.days}
      rows={data.rows}
      rowKey={(r) => r.cityName}
      placeholders={placeholders}
      cell={(r, dk) => {
        const v = r.daily[dk] ?? 0;
        return v === 0 ? <span className="text-gray-300">0</span> : fmtInt(v);
      }}
    />
  );
}
