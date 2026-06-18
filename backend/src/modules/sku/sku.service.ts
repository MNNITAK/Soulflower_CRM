import { query } from "../../db/pool.js";
import { loadSql } from "../../db/sqlLoader.js";
import { introspect } from "../../db/schema.js";
import {
  resolveRange,
  dayList,
  toDateStr,
  type DateRange,
} from "../../shared/dates.js";
import { pivotByDate } from "../../shared/pivot.js";
import { reportParams } from "../../shared/sqlParams.js";
import type { SkuReport, SkuRow } from "../../shared/types.js";

interface SkuDayAgg {
  itemId: string;
  itemName: string;
  d: string;
  qty: number;
}

async function fetchByDay(
  range: DateRange,
  platform?: string,
): Promise<SkuDayAgg[]> {
  const rows = await query<{
    itemId: unknown;
    itemName: string;
    d: unknown;
    qty: number;
  }>(loadSql("sku/by_day.sql"), reportParams(range, platform));
  return rows.map((r) => ({
    itemId: String(r.itemId),
    itemName: r.itemName ?? "",
    d: toDateStr(r.d),
    qty: Number(r.qty) || 0,
  }));
}

async function fetchMrpMode(
  range: DateRange,
  platform?: string,
): Promise<Map<string, number>> {
  const rows = await query<{ itemId: unknown; mrp: number }>(
    loadSql("sku/mrp_mode.sql"),
    reportParams(range, platform),
  );
  const m = new Map<string, number>();
  for (const r of rows) m.set(String(r.itemId), Number(r.mrp) || 0);
  return m;
}

export async function buildSkuReport(opts: {
  month?: string;
  from?: string;
  to?: string;
  platform?: string;
}): Promise<SkuReport> {
  const { date1Strategy } = await introspect();
  const range = resolveRange(opts);
  const days = dayList(range);
  const platform = opts.platform;

  const [flat, mrpMode] = await Promise.all([
    fetchByDay(range, platform),
    fetchMrpMode(range, platform),
  ]);

  const pivoted = pivotByDate(flat, {
    keyOf: (r) => r.itemId,
    dateOf: (r) => r.d,
    valueOf: (r) => r.qty,
    metaOf: (r) => ({ itemName: r.itemName }),
    days,
  });

  const grandTotalQty = pivoted.reduce((a, p) => a + p.total, 0);

  const rows: SkuRow[] = pivoted
    .sort((a, b) => b.total - a.total)
    .map((p, i) => ({
      ranking: i + 1,
      skuId: p.key,
      productName: String(p.meta.itemName ?? ""),
      mrp: mrpMode.get(p.key) ?? 0,
      salesMix: grandTotalQty > 0 ? p.total / grandTotalQty : 0,
      grandTotal: p.total,
      dailyAvg: days.length > 0 ? p.total / days.length : 0,
      daily: p.daily,
      placeholders: {
        backendStock: null,
        frontendStock: null,
        openPo: null,
        totalSoh: null,
        sohCover: null,
      },
    }));

  return {
    report: "sku",
    range: { from: range.from, to: days.at(-1)?.date ?? range.from },
    platform: platform ?? null,
    date1Strategy,
    generatedAt: new Date().toISOString(),
    days,
    grandTotalQty,
    rows,
  };
}
