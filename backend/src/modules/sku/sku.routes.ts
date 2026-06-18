import { Router } from "express";
import { parseReportQuery } from "../../shared/reportQuery.js";
import { buildSkuReport } from "./sku.service.js";

export const skuRouter = Router();

skuRouter.get("/", async (req, res, next) => {
  try {
    const q = parseReportQuery(req, res);
    if (!q) return;
    res.json(await buildSkuReport(q));
  } catch (err) {
    next(err);
  }
});
