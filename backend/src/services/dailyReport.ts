import { introspect } from "../db/schema.js";
import { resolveRange, priorPeriod, dayList } from "../lib/dates.js";
import { fetchDateTotals } from "./reportData.js";
import type { DailyReport, DailyMetric, DailyRow } from "../types.js";

const metric = (qty: number, mrpValue: number): DailyMetric => ({
  qty,
  mrpValue,
  avgPrice: qty > 0 ? mrpValue / qty : 0,
});

const growth = (cur: number, prev: number | null): number | null => {
  if (prev === null || prev === 0) return null;
  return (cur - prev) / prev;
};

export async function buildDailyReport(opts: {
  month?: string;
  from?: string;
  to?: string;
  platform?: string;
}): Promise<DailyReport> {
  const { date1Strategy } = await introspect();
  const range = resolveRange(opts);
  const prior = priorPeriod(range);
  const platform = opts.platform;

  const [curTotals, priTotals] = await Promise.all([
    fetchDateTotals(date1Strategy, range, platform),
    fetchDateTotals(date1Strategy, prior, platform),
  ]);

  const curByDate = new Map(curTotals.map((r) => [r.d, r]));
  const priByDate = new Map(priTotals.map((r) => [r.d, r]));

  const curDays = dayList(range);
  const priDays = dayList(prior);

  const rows: DailyRow[] = curDays.map((day, i) => {
    const c = curByDate.get(day.date);
    const cur = metric(c?.qty ?? 0, c?.mrpValue ?? 0);

    // Align prior by index (offset from each range start).
    const priDay = priDays[i];
    const p = priDay ? priByDate.get(priDay.date) : undefined;
    const prior = priDay ? metric(p?.qty ?? 0, p?.mrpValue ?? 0) : null;

    return {
      dayOfMonth: day.dayOfMonth,
      dow: day.dow,
      date: day.date,
      current: cur,
      prior,
      growth: {
        qty: growth(cur.qty, prior?.qty ?? null),
        mrpValue: growth(cur.mrpValue, prior?.mrpValue ?? null),
        avgPrice: growth(cur.avgPrice, prior?.avgPrice ?? null),
      },
      placeholders: {
        target: null,
        achPct: null,
        delta: null,
        marketingBudget: null,
        budgetUtilised: null,
        pendingBudget: null,
        impressions: null,
      },
    };
  });

  const sum = (arr: { qty: number; mrpValue: number }[]) =>
    arr.reduce(
      (a, r) => ({ qty: a.qty + r.qty, mrpValue: a.mrpValue + r.mrpValue }),
      { qty: 0, mrpValue: 0 },
    );
  const ct = sum(curTotals);
  const pt = sum(priTotals);

  return {
    report: "daily",
    range: { from: range.from, to: lastInclusive(range.toExclusive) },
    prior: { from: prior.from, to: lastInclusive(prior.toExclusive) },
    platform: platform ?? null,
    date1Strategy,
    generatedAt: new Date().toISOString(),
    rows,
    totals: {
      current: metric(ct.qty, ct.mrpValue),
      prior: priTotals.length ? metric(pt.qty, pt.mrpValue) : null,
    },
  };
}

function lastInclusive(toExclusive: string): string {
  const d = new Date(toExclusive + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}
