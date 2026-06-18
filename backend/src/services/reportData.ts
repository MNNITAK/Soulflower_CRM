import { query, sql, type SqlParam } from "../db/pool.js";
import { dateExpr, type Date1Strategy } from "../db/schema.js";
import type { DateRange } from "../lib/dates.js";

/** Normalize a value coming back from the `date` column to 'YYYY-MM-DD'. */
export function toDateStr(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).slice(0, 10);
}

function baseParams(range: DateRange, platform?: string): SqlParam[] {
  const p: SqlParam[] = [
    { name: "from", type: sql.VarChar(10), value: range.from },
    { name: "toExclusive", type: sql.VarChar(10), value: range.toExclusive },
  ];
  if (platform) p.push({ name: "platform", type: sql.VarChar(100), value: platform });
  return p;
}

/** WHERE fragment shared by all reports (date range + optional platform). */
function whereClause(D: string, platform?: string, extra = ""): string {
  const platformFilter = platform ? " AND LOWER(platform) = LOWER(@platform)" : "";
  return `WHERE ${D} >= @from AND ${D} < @toExclusive${platformFilter}${extra}`;
}

/** Distinct platforms (for the dashboard picker). */
export async function fetchPlatforms(): Promise<string[]> {
  const rows = await query<{ platform: string }>(
    `SELECT platform, SUM(CAST(quantity AS bigint)) qty
     FROM dbo.raw_sales
     WHERE platform IS NOT NULL AND platform <> ''
     GROUP BY platform
     ORDER BY qty DESC`,
  );
  return rows.map((r) => r.platform);
}

export interface DateAgg {
  d: string;
  qty: number;
  mrpValue: number;
}

/** Per-day totals (qty + MRP value) within a range. */
export async function fetchDateTotals(
  strategy: Date1Strategy,
  range: DateRange,
  platform?: string,
): Promise<DateAgg[]> {
  const D = dateExpr(strategy);
  const rows = await query<{ d: unknown; qty: number; mrpValue: number }>(
    `SELECT ${D} AS d,
            SUM(CAST(quantity AS bigint)) AS qty,
            SUM(CAST(quantity AS float) * CAST(mrp AS float)) AS mrpValue
     FROM dbo.raw_sales
     ${whereClause(D, platform)}
     GROUP BY ${D}
     ORDER BY ${D}`,
    baseParams(range, platform),
  );
  return rows.map((r) => ({
    d: toDateStr(r.d),
    qty: Number(r.qty) || 0,
    mrpValue: Number(r.mrpValue) || 0,
  }));
}

export interface SkuDayAgg {
  itemId: string;
  itemName: string;
  d: string;
  qty: number;
}

/** Per-SKU, per-day quantity within a range. */
export async function fetchSkuDay(
  strategy: Date1Strategy,
  range: DateRange,
  platform?: string,
): Promise<SkuDayAgg[]> {
  const D = dateExpr(strategy);
  const rows = await query<{
    itemId: unknown;
    itemName: string;
    d: unknown;
    qty: number;
  }>(
    `SELECT CAST(sku_id AS varchar(50)) AS itemId,
            MAX(product_name) AS itemName,
            ${D} AS d,
            SUM(CAST(quantity AS bigint)) AS qty
     FROM dbo.raw_sales
     ${whereClause(D, platform, " AND sku_id IS NOT NULL")}
     GROUP BY sku_id, ${D}
     ORDER BY sku_id`,
    baseParams(range, platform),
  );
  return rows.map((r) => ({
    itemId: String(r.itemId),
    itemName: r.itemName ?? "",
    d: toDateStr(r.d),
    qty: Number(r.qty) || 0,
  }));
}

/**
 * Most-common (mode) MRP per SKU within a range — robust against the inflated
 * data-entry outliers present in the raw table.
 */
export async function fetchSkuMrpMode(
  strategy: Date1Strategy,
  range: DateRange,
  platform?: string,
): Promise<Map<string, number>> {
  const D = dateExpr(strategy);
  const rows = await query<{ itemId: unknown; mrp: number }>(
    `WITH counts AS (
       SELECT CAST(sku_id AS varchar(50)) AS itemId,
              CAST(mrp AS float) AS mrp,
              COUNT(*) AS c
       FROM dbo.raw_sales
       ${whereClause(D, platform, " AND sku_id IS NOT NULL AND mrp > 0")}
       GROUP BY sku_id, CAST(mrp AS float)
     ),
     ranked AS (
       SELECT itemId, mrp,
              ROW_NUMBER() OVER (PARTITION BY itemId ORDER BY c DESC, mrp ASC) AS rn
       FROM counts
     )
     SELECT itemId, mrp FROM ranked WHERE rn = 1`,
    baseParams(range, platform),
  );
  const m = new Map<string, number>();
  for (const r of rows) m.set(String(r.itemId), Number(r.mrp) || 0);
  return m;
}

export interface CityDayAgg {
  cityName: string;
  region: string | null;
  d: string;
  qty: number;
}

/** Per-city, per-day quantity within a range (junk city rows excluded). */
export async function fetchCityDay(
  strategy: Date1Strategy,
  range: DateRange,
  platform?: string,
): Promise<CityDayAgg[]> {
  const D = dateExpr(strategy);
  const rows = await query<{
    cityName: string;
    region: string | null;
    d: unknown;
    qty: number;
  }>(
    `SELECT city AS cityName,
            MAX(region) AS region,
            ${D} AS d,
            SUM(CAST(quantity AS bigint)) AS qty
     FROM dbo.raw_sales
     ${whereClause(
       D,
       platform,
       " AND city IS NOT NULL AND city NOT IN ('0', '0.0', '')",
     )}
     GROUP BY city, ${D}
     ORDER BY city`,
    baseParams(range, platform),
  );
  return rows.map((r) => ({
    cityName: r.cityName ?? "(unknown)",
    region: r.region ?? null,
    d: toDateStr(r.d),
    qty: Number(r.qty) || 0,
  }));
}
