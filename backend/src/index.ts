import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import { config } from "./config.js";
import { reportsRouter } from "./routes/reports.js";
import { metaRouter } from "./routes/meta.js";
import { introspect } from "./db/schema.js";

const app = express();

app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json());

app.use("/api", metaRouter);
app.use("/api/reports", reportsRouter);

app.get("/", (_req, res) => {
  res.json({
    service: "soulflower-sales-backend",
    endpoints: [
      "/api/health",
      "/api/schema",
      "/api/reports/daily?month=YYYY-MM",
      "/api/reports/sku?month=YYYY-MM",
      "/api/reports/city?month=YYYY-MM",
    ],
  });
});

// Central error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error("[error]", message);
  res.status(500).json({ error: "Internal error", message });
});

app.listen(config.PORT, () => {
  console.log(`[server] listening on http://localhost:${config.PORT}`);
  // Warm up the schema introspection (and surface DB problems early).
  introspect().catch((err) => {
    console.error(
      "[startup] Could not introspect dbo.raw_sales yet:",
      err instanceof Error ? err.message : err,
    );
  });
});
