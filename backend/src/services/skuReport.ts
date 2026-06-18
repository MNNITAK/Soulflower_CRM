import { introspect } from "../db/schema.js";
import { resolveRange, dayList } from "../lib/dates.js";
import { pivotByDate } from "../lib/pivot.js";
import { fetchSkuDay, fetchSkuMrpMode } from "./reportData.js";
import type { SkuReport, SkuRow } from "../types.js";

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
    fetchSkuDay(date1Strategy, range, platform),
    fetchSkuMrpMode(date1Strategy, range, platform),
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
