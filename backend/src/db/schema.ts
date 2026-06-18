import { query } from "./pool.js";

export type Date1Strategy = "NATIVE_DATE" | "EXCEL_SERIAL" | "STRING_DATE";

export interface ColumnInfo {
  name: string;
  dataType: string;
}

/** The date column used by all reports. */
export const DATE_COLUMN = "order_date";

export interface SchemaInfo {
  table: string;
  columns: ColumnInfo[];
  dateColumn: string;
  date1Type: string | null;
  date1Strategy: Date1Strategy;
  date1Sample: unknown[];
}

let cached: SchemaInfo | null = null;

const DATE_TYPES = new Set([
  "date",
  "datetime",
  "datetime2",
  "smalldatetime",
  "datetimeoffset",
]);
const NUMERIC_TYPES = new Set([
  "int",
  "bigint",
  "smallint",
  "tinyint",
  "numeric",
  "decimal",
  "float",
  "real",
  "money",
]);
const STRING_TYPES = new Set([
  "varchar",
  "nvarchar",
  "char",
  "nchar",
  "text",
  "ntext",
]);

function strategyFor(dataType: string | null): Date1Strategy {
  if (!dataType) return "EXCEL_SERIAL";
  const t = dataType.toLowerCase();
  if (DATE_TYPES.has(t)) return "NATIVE_DATE";
  if (NUMERIC_TYPES.has(t)) return "EXCEL_SERIAL";
  if (STRING_TYPES.has(t)) return "STRING_DATE";
  // Unknown type: assume serial, since the reference data uses Excel serials.
  return "EXCEL_SERIAL";
}

/**
 * Introspect dbo.raw_sales once and cache the result, including a resolved
 * strategy for interpreting the `date1` column.
 */
export async function introspect(force = false): Promise<SchemaInfo> {
  if (cached && !force) return cached;

  const columns = await query<{ COLUMN_NAME: string; DATA_TYPE: string }>(
    `SELECT COLUMN_NAME, DATA_TYPE
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'raw_sales'
     ORDER BY ORDINAL_POSITION`,
  );

  if (columns.length === 0) {
    throw new Error("Table dbo.raw_sales not found (or no permission).");
  }

  const dateCol = columns.find(
    (c) => c.COLUMN_NAME.toLowerCase() === DATE_COLUMN,
  );
  const date1Type = dateCol ? dateCol.DATA_TYPE : null;
  const date1Strategy = strategyFor(date1Type);

  let date1Sample: unknown[] = [];
  try {
    const sample = await query<{ d: unknown }>(
      `SELECT TOP 5 ${DATE_COLUMN} AS d FROM dbo.raw_sales`,
    );
    date1Sample = sample.map((r) => r.d);
  } catch {
    /* sampling is best-effort */
  }

  cached = {
    table: "dbo.raw_sales",
    columns: columns.map((c) => ({ name: c.COLUMN_NAME, dataType: c.DATA_TYPE })),
    dateColumn: DATE_COLUMN,
    date1Type,
    date1Strategy,
    date1Sample,
  };

  console.log(
    `[schema] ${DATE_COLUMN} type='${date1Type}' -> strategy=${date1Strategy}; ` +
      `sample=${JSON.stringify(date1Sample)}`,
  );

  return cached;
}
