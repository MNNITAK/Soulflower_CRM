"use client";

import type { DailyReport } from "@/lib/types";
import { fmtInt, fmtCurrency, fmtNum2, fmtPct, growthClass } from "@/lib/format";

const th = "border-b border-r border-gray-200 px-2 py-2 font-semibold text-gray-700";
const td = "border-b border-r border-gray-100 px-2 py-1.5 text-right tabular-nums";

export default function DailyReportTable({ data }: { data: DailyReport }) {
  return (
    <div className="overflow-auto rounded-lg border border-gray-200 bg-white shadow-sm max-h-[calc(100vh-160px)]">
      <table className="border-collapse text-sm" style={{ minWidth: "max-content" }}>
        <thead>
          <tr>
            <th className={`sticky top-0 z-20 bg-gray-100 ${th}`} rowSpan={2}>
              Day
            </th>
            <th className={`sticky top-0 z-20 bg-gray-100 ${th}`} rowSpan={2}>
              Date
            </th>
            <th className={`sticky top-0 z-20 bg-blue-50 ${th} text-center`} colSpan={3}>
              Current ({data.range.from} → {data.range.to})
            </th>
            <th className={`sticky top-0 z-20 bg-sky-50 ${th} text-center`} colSpan={3}>
              Prior ({data.prior.from} → {data.prior.to})
            </th>
            <th className={`sticky top-0 z-20 bg-amber-50 ${th} text-center`} colSpan={3}>
              Growth %
            </th>
            <th className={`sticky top-0 z-20 bg-gray-50 ${th} text-center text-gray-400`} colSpan={3}>
              Target / Marketing (n/a)
            </th>
          </tr>
          <tr>
            {["Qty", "MRP Value", "Avg Price"].map((h) => (
              <th key={"c" + h} className={`sticky top-[37px] z-20 bg-blue-50 ${th}`}>
                {h}
              </th>
            ))}
            {["Qty", "MRP Value", "Avg Price"].map((h) => (
              <th key={"p" + h} className={`sticky top-[37px] z-20 bg-sky-50 ${th}`}>
                {h}
              </th>
            ))}
            {["Qty", "MRP", "Avg"].map((h) => (
              <th key={"g" + h} className={`sticky top-[37px] z-20 bg-amber-50 ${th}`}>
                {h}
              </th>
            ))}
            {["Target", "Budget", "Impr."].map((h) => (
              <th
                key={"x" + h}
                className={`sticky top-[37px] z-20 bg-gray-50 ${th} text-[11px] font-medium text-gray-400`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((r, i) => (
            <tr key={r.date} className={i % 2 ? "bg-gray-50/50" : "bg-white"}>
              <td className="border-b border-r border-gray-100 px-2 py-1.5 font-medium text-gray-600">
                {r.dow}
              </td>
              <td className="border-b border-r border-gray-100 px-2 py-1.5 text-gray-600">
                {r.date}
              </td>
              <td className={td}>{fmtInt(r.current.qty)}</td>
              <td className={td}>{fmtCurrency(r.current.mrpValue)}</td>
              <td className={td}>{fmtNum2(r.current.avgPrice)}</td>
              <td className={`${td} text-gray-500`}>{fmtInt(r.prior?.qty)}</td>
              <td className={`${td} text-gray-500`}>{fmtCurrency(r.prior?.mrpValue)}</td>
              <td className={`${td} text-gray-500`}>{fmtNum2(r.prior?.avgPrice)}</td>
              <td className={`${td} ${growthClass(r.growth.qty)}`}>{fmtPct(r.growth.qty)}</td>
              <td className={`${td} ${growthClass(r.growth.mrpValue)}`}>
                {fmtPct(r.growth.mrpValue)}
              </td>
              <td className={`${td} ${growthClass(r.growth.avgPrice)}`}>
                {fmtPct(r.growth.avgPrice)}
              </td>
              <td className={`${td} text-gray-300`}>—</td>
              <td className={`${td} text-gray-300`}>—</td>
              <td className={`${td} text-gray-300`}>—</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-100 font-semibold">
            <td className="border-t border-r border-gray-200 px-2 py-2" colSpan={2}>
              Total
            </td>
            <td className={td}>{fmtInt(data.totals.current.qty)}</td>
            <td className={td}>{fmtCurrency(data.totals.current.mrpValue)}</td>
            <td className={td}>{fmtNum2(data.totals.current.avgPrice)}</td>
            <td className={`${td} text-gray-500`}>{fmtInt(data.totals.prior?.qty)}</td>
            <td className={`${td} text-gray-500`}>
              {fmtCurrency(data.totals.prior?.mrpValue)}
            </td>
            <td className={`${td} text-gray-500`}>{fmtNum2(data.totals.prior?.avgPrice)}</td>
            <td className={td} colSpan={6}></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
