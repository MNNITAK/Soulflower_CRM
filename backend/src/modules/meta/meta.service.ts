import { query } from "../../db/pool.js";
import { loadSql } from "../../db/sqlLoader.js";

/** Distinct platforms (for the dashboard picker), busiest first. */
export async function fetchPlatforms(): Promise<string[]> {
  const rows = await query<{ platform: string }>(loadSql("meta/platforms.sql"));
  return rows.map((r) => r.platform);
}
