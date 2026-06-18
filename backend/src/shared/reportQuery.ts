import type { Request, Response } from "express";
import { z } from "zod";

export const reportQuerySchema = z.object({
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

export type ReportQuery = z.infer<typeof reportQuerySchema>;

/**
 * Validate the report query string. On failure it sends a 400 and returns null,
 * so route handlers can simply: `const q = parseReportQuery(req, res); if (!q) return;`
 */
export function parseReportQuery(req: Request, res: Response): ReportQuery | null {
  const parsed = reportQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query", issues: parsed.error.issues });
    return null;
  }
  return parsed.data;
}
