import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// .../src/db/sqlLoader.ts  ->  .../src/sql
const SQL_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "sql");

/**
 * Load a .sql file from src/sql by its relative path, e.g.
 *   loadSql("daily/totals.sql")
 *
 * The file is read fresh on every call (no caching) so that editing a .sql
 * file takes effect immediately — no server restart needed. SQL files are tiny,
 * so the read cost is negligible.
 */
export function loadSql(relativePath: string): string {
  return readFileSync(join(SQL_DIR, relativePath), "utf8");
}
