import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import { config } from "./config.js";
import { introspect } from "./db/schema.js";
import { dailyRouter } from "./modules/daily/daily.routes.js";
import { skuRouter } from "./modules/sku/sku.routes.js";
import { cityRouter } from "./modules/city/city.routes.js";
import { metaRouter } from "./modules/meta/meta.routes.js";

const app = express();

app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json());

// meta endpoints: /api/health, /api/schema, /api/platforms
app.use("/api", metaRouter);

// report modules
app.use("/api/reports/daily", dailyRouter);
app.use("/api/reports/sku", skuRouter);
app.use("/api/reports/city", cityRouter);

app.get("/", (_req, res) => {
  res.json({
    service: "soulflower-sales-backend",
    endpoints: [
      "/api/health",
      "/api/schema",
      "/api/platforms",
      "/api/reports/daily?month=YYYY-MM&platform=blinkit",
      "/api/reports/sku?month=YYYY-MM&platform=blinkit",
      "/api/reports/city?month=YYYY-MM&platform=blinkit",
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
  introspect().catch((err) => {
    console.error(
      "[startup] Could not introspect dbo.raw_sales yet:",
      err instanceof Error ? err.message : err,
    );
  });
});
