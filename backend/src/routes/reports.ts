import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { buildDailyReport } from "../services/dailyReport.js";
import { buildSkuReport } from "../services/skuReport.js";
import { buildCityReport } from "../services/cityReport.js";

const querySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "month must be YYYY-MM")
    .optional(),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "from must be YYYY-MM-DD")
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "to must be YYYY-MM-DD")
    .optional(),
  limit: z.coerce.number().int().positive().max(1000).optional(),
  platform: z.string().min(1).max(100).optional(),
});

function parseQuery(req: Request, res: Response) {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query", issues: parsed.error.issues });
    return null;
  }
  return parsed.data;
}

export const reportsRouter = Router();

reportsRouter.get("/daily", async (req, res, next) => {
  try {
    const q = parseQuery(req, res);
    if (!q) return;
    res.json(await buildDailyReport(q));
  } catch (err) {
    next(err);
  }
});

reportsRouter.get("/sku", async (req, res, next) => {
  try {
    const q = parseQuery(req, res);
    if (!q) return;
    res.json(await buildSkuReport(q));
  } catch (err) {
    next(err);
  }
});

reportsRouter.get("/city", async (req, res, next) => {
  try {
    const q = parseQuery(req, res);
    if (!q) return;
    res.json(await buildCityReport(q));
  } catch (err) {
    next(err);
  }
});
