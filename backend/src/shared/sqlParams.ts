import { sql, type SqlParam } from "../db/pool.js";
import type { DateRange } from "./dates.js";

/**
 * Standard parameters shared by every report query: the date range and the
 * (optional) platform filter. Pass these straight to `query(sqlText, params)`.
 * When no platform is selected we pass NULL, and the SQL handles it with
 * `(@platform IS NULL OR ...)`.
 */
export function reportParams(
  range: DateRange,
  platform?: string | null,
): SqlParam[] {
  return [
    { name: "from", type: sql.VarChar(10), value: range.from },
    { name: "toExclusive", type: sql.VarChar(10), value: range.toExclusive },
    { name: "platform", type: sql.VarChar(100), value: platform ?? null },
  ];
}
