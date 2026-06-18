import type { DayInfo } from "./dates.js";

/**
 * Reshape flat (entity, date, value) rows into one object per entity with a
 * `daily` map keyed by date string ('YYYY-MM-DD'), zero-filled for missing days.
 */
export function pivotByDate<R>(
  rows: R[],
  opts: {
    keyOf: (row: R) => string;
    dateOf: (row: R) => string;
    valueOf: (row: R) => number;
    /** carries non-aggregated fields (name, region, ...) from the first seen row */
    metaOf?: (row: R) => Record<string, unknown>;
    days: DayInfo[];
  },
): Array<{
  key: string;
  meta: Record<string, unknown>;
  daily: Record<string, number>;
  total: number;
}> {
  const dateKeys = opts.days.map((d) => d.date);
  const byKey = new Map<
    string,
    { key: string; meta: Record<string, unknown>; daily: Record<string, number>; total: number }
  >();

  for (const row of rows) {
    const key = opts.keyOf(row);
    let entry = byKey.get(key);
    if (!entry) {
      const daily: Record<string, number> = {};
      for (const dk of dateKeys) daily[dk] = 0;
      entry = {
        key,
        meta: opts.metaOf ? opts.metaOf(row) : {},
        daily,
        total: 0,
      };
      byKey.set(key, entry);
    }
    const date = opts.dateOf(row);
    const val = opts.valueOf(row);
    if (date in entry.daily) entry.daily[date] += val;
    entry.total += val;
  }

  return [...byKey.values()];
}
