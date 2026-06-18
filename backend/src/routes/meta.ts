import { Router } from "express";
import { getPool } from "../db/pool.js";
import { introspect } from "../db/schema.js";
import { fetchPlatforms } from "../services/reportData.js";

export const metaRouter = Router();

metaRouter.get("/platforms", async (_req, res, next) => {
  try {
    res.json({ platforms: await fetchPlatforms() });
  } catch (err) {
    next(err);
  }
});

metaRouter.get("/health", async (_req, res, next) => {
  try {
    const pool = await getPool();
    await pool.request().query("SELECT 1 AS ok");
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

metaRouter.get("/schema", async (_req, res, next) => {
  try {
    res.json(await introspect());
  } catch (err) {
    next(err);
  }
});
