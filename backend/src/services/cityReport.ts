import { introspect } from "../db/schema.js";
import { resolveRange, dayList } from "../lib/dates.js";
import { pivotByDate } from "../lib/pivot.js";
import { regionForCity } from "../lib/cityRegion.js";
import { fetchCityDay } from "./reportData.js";
import type { CityReport, CityRow } from "../types.js";

const TOP_N = 50;

export async function buildCityReport(opts: {
  month?: string;
  from?: string;
  to?: string;
  limit?: number;
  platform?: string;
}): Promise<CityReport> {
  const { date1Strategy } = await introspect();
  const range = resolveRange(opts);
  const days = dayList(range);
  const platform = opts.platform;

  const flat = await fetchCityDay(date1Strategy, range, platform);

  const pivoted = pivotByDate(flat, {
    keyOf: (r) => r.cityName,
    dateOf: (r) => r.d,
    valueOf: (r) => r.qty,
    metaOf: (r) => ({ region: r.region }),
    days,
  });

  // grand total is across ALL cities (so mix % is meaningful even when limited)
  const grandTotalQty = pivoted.reduce((a, p) => a + p.total, 0);
  const limit = opts.limit ?? TOP_N;

  const rows: CityRow[] = pivoted
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
    .map((p, i) => ({
      ranking: i + 1,
      region: (p.meta.region as string | null) || regionForCity(p.key),
      cityName: p.key,
      salesMix: grandTotalQty > 0 ? p.total / grandTotalQty : 0,
      grandTotal: p.total,
      dailyAvg: days.length > 0 ? p.total / days.length : 0,
      daily: p.daily,
      placeholders: {
        backendStock: null,
        frontendStock: null,
        totalSoh: null,
        sohCover: null,
      },
    }));

  return {
    report: "city",
    range: { from: range.from, to: days.at(-1)?.date ?? range.from },
    platform: platform ?? null,
    date1Strategy,
    generatedAt: new Date().toISOString(),
    days,
    grandTotalQty,
    rows,
  };
}
