import { Router } from "express";
import { parseReportQuery } from "../../shared/reportQuery.js";
import { buildCityReport } from "./city.service.js";

export const cityRouter = Router();

cityRouter.get("/", async (req, res, next) => {
  try {
    const q = parseReportQuery(req, res);
    if (!q) return;
    res.json(await buildCityReport(q));
  } catch (err) {
    next(err);
  }
});
