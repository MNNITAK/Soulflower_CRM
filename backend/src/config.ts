import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  DB_SERVER: z.string().min(1, "DB_SERVER is required"),
  DB_NAME: z.string().min(1, "DB_NAME is required"),
  DB_USER: z.string().min(1, "DB_USER is required"),
  DB_PASSWORD: z.string().min(1, "DB_PASSWORD is required"),
  DB_PORT: z.coerce.number().int().positive().default(1433),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  console.error(
    `\n[config] Invalid/missing environment variables:\n${issues}\n\n` +
      `Copy backend/.env.example to backend/.env and fill in your Azure SQL credentials.\n`,
  );
  process.exit(1);
}

export const config = parsed.data;
export type Config = typeof config;
