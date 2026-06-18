"use client";

import React from "react";
import type { DayInfo } from "@/lib/types";

export interface FrozenColumn<Row> {
  key: string;
  header: string;
  width: number; // px
  align?: "left" | "right" | "center";
  render: (row: Row) => React.ReactNode;
}

export interface PlaceholderColumn {
  key: string;
  header: string;
  width: number;
}

interface Props<Row> {
  frozen: FrozenColumn<Row>[];
  days: DayInfo[];
  rows: Row[];
  rowKey: (row: Row) => string;
  cell: (row: Row, dateKey: string) => React.ReactNode;
  placeholders?: PlaceholderColumn[];
  dayWidth?: number;
}

const alignClass = (a?: string) =>
  a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left";

export default function PivotTable<Row>({
  frozen,
  days,
  rows,
  rowKey,
  cell,
  placeholders = [],
  dayWidth = 52,
}: Props<Row>) {
  // cumulative left offsets for sticky frozen columns
  const offsets: number[] = [];
  frozen.reduce((acc, c, i) => {
    offsets[i] = acc;
    return acc + c.width;
  }, 0);

  return (
    <div className="overflow-auto rounded-lg border border-gray-200 bg-white shadow-sm max-h-[calc(100vh-160px)]">
      <table className="border-collapse text-sm" style={{ minWidth: "max-content" }}>
        <thead>
          <tr>
            {frozen.map((c, i) => (
              <th
                key={c.key}
                className={
                  "sticky top-0 z-30 border-b border-r border-gray-200 bg-gray-100 px-2 py-2 font-semibold text-gray-700 " +
                  alignClass(c.align)
                }
                style={{
                  left: offsets[i],
                  minWidth: c.width,
                  width: c.width,
                }}
              >
                {c.header}
              </th>
            ))}
            {placeholders.map((p) => (
              <th
                key={p.key}
                className="sticky top-0 z-20 border-b border-r border-gray-200 bg-gray-50 px-2 py-2 text-center text-[11px] font-medium text-gray-400"
                style={{ minWidth: p.width, width: p.width }}
                title="Not available from raw_sales yet"
              >
                {p.header}
              </th>
            ))}
            {days.map((d) => (
              <th
                key={d.date}
                className="sticky top-0 z-20 border-b border-r border-gray-200 bg-gray-100 px-1 py-1 text-center font-semibold text-gray-600"
                style={{ minWidth: dayWidth, width: dayWidth }}
                title={d.date}
              >
                <div className="leading-tight">{d.dayOfMonth}</div>
                <div className="text-[10px] font-normal text-gray-400">
                  {d.dow}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={rowKey(row)} className={ri % 2 ? "bg-gray-50/50" : "bg-white"}>
              {frozen.map((c, i) => (
                <td
                  key={c.key}
                  className={
                    "sticky z-10 border-b border-r border-gray-100 px-2 py-1.5 " +
                    alignClass(c.align) +
                    (ri % 2 ? " bg-gray-50" : " bg-white")
                  }
                  style={{ left: offsets[i], minWidth: c.width, width: c.width }}
                >
                  {c.render(row)}
                </td>
              ))}
              {placeholders.map((p) => (
                <td
                  key={p.key}
                  className="border-b border-r border-gray-100 px-2 py-1.5 text-center text-gray-300"
                  style={{ minWidth: p.width, width: p.width }}
                >
                  —
                </td>
              ))}
              {days.map((d) => (
                <td
                  key={d.date}
                  className="border-b border-r border-gray-100 px-1 py-1.5 text-right tabular-nums text-gray-700"
                  style={{ minWidth: dayWidth, width: dayWidth }}
                >
                  {cell(row, d.date)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
