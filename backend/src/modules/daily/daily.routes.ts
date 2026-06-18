import { Router } from "express";
import { parseReportQuery } from "../../shared/reportQuery.js";
import { buildDailyReport } from "./daily.service.js";

export const dailyRouter = Router();

dailyRouter.get("/", async (req, res, next) => {
  try {
    const q = parseReportQuery(req, res);
    if (!q) return;
    res.json(await buildDailyReport(q));
  } catch (err) {
    next(err);
  }
});
