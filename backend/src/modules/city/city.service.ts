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
import { regionForCity } from "../../shared/cityRegion.js";
import { reportParams } from "../../shared/sqlParams.js";
import type { CityReport, CityRow } from "../../shared/types.js";

const TOP_N = 50;

interface CityDayAgg {
  cityName: string;
  region: string | null;
  d: string;
  qty: number;
}

async function fetchByDay(
  range: DateRange,
  platform?: string,
): Promise<CityDayAgg[]> {
  const rows = await query<{
    cityName: string;
    region: string | null;
    d: unknown;
    qty: number;
  }>(loadSql("city/by_day.sql"), reportParams(range, platform));
  return rows.map((r) => ({
    cityName: r.cityName ?? "(unknown)",
    region: r.region ?? null,
    d: toDateStr(r.d),
    qty: Number(r.qty) || 0,
  }));
}

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

  const flat = await fetchByDay(range, platform);

  const pivoted = pivotByDate(flat, {
    keyOf: (r) => r.cityName,
    dateOf: (r) => r.d,
    valueOf: (r) => r.qty,
    metaOf: (r) => ({ region: r.region }),
    days,
  });

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
