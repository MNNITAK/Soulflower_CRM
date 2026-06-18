import sql from "mssql";
import { config } from "../config.js";

const sqlConfig: sql.config = {
  server: config.DB_SERVER,
  database: config.DB_NAME,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  port: config.DB_PORT,
  options: {
    encrypt: true, // required for Azure SQL
    trustServerCertificate: false,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  requestTimeout: 60000,
  connectionTimeout: 30000,
};

let poolPromise: Promise<sql.ConnectionPool> | null = null;

/** Lazily create (once) and return the shared connection pool. */
export function getPool(): Promise<sql.ConnectionPool> {
  if (poolPromise) return poolPromise;
  const p = new sql.ConnectionPool(sqlConfig)
    .connect()
    .then((pool: sql.ConnectionPool) => {
      console.log(`[db] Connected to ${config.DB_SERVER}/${config.DB_NAME}`);
      return pool;
    })
    .catch((err: unknown) => {
      // Reset so a later call can retry.
      poolPromise = null;
      throw err;
    });
  poolPromise = p;
  return p;
}

export type SqlParam = {
  name: string;
  type: sql.ISqlType | (() => sql.ISqlType);
  value: unknown;
};

/** Run a parameterized query and return the recordset rows. */
export async function query<T = Record<string, unknown>>(
  text: string,
  params: SqlParam[] = [],
): Promise<T[]> {
  const pool = await getPool();
  const request = pool.request();
  for (const p of params) {
    request.input(p.name, p.type as sql.ISqlType, p.value);
  }
  const result = await request.query<T>(text);
  return result.recordset ?? [];
}

export { sql };
