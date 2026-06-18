import type { Date1Strategy } from "../db/schema.js";
import type { DayInfo } from "./dates.js";

export interface RangeMeta {
  from: string;
  to: string; // inclusive display end
}

export interface ReportMetaBase {
  report: "daily" | "sku" | "city";
  range: RangeMeta;
  platform: string | null;
  date1Strategy: Date1Strategy;
  generatedAt: string;
}

/* ---------- Daily ---------- */
export interface DailyMetric {
  qty: number;
  mrpValue: number;
  avgPrice: number;
}
export interface DailyRow {
  dayOfMonth: number;
  dow: string;
  date: string;
  current: DailyMetric;
  prior: DailyMetric | null;
  growth: { qty: number | null; mrpValue: number | null; avgPrice: number | null };
  placeholders: {
    target: null;
    achPct: null;
    delta: null;
    marketingBudget: null;
    budgetUtilised: null;
    pendingBudget: null;
    impressions: null;
  };
}
export interface DailyReport extends ReportMetaBase {
  report: "daily";
  prior: RangeMeta;
  rows: DailyRow[];
  totals: { current: DailyMetric; prior: DailyMetric | null };
}

/* ---------- SKU ---------- */
export interface SkuRow {
  ranking: number;
  skuId: string;
  productName: string;
  mrp: number;
  salesMix: number;
  grandTotal: number;
  dailyAvg: number;
  daily: Record<string, number>;
  placeholders: {
    backendStock: null;
    frontendStock: null;
    openPo: null;
    totalSoh: null;
    sohCover: null;
  };
}
export interface SkuReport extends ReportMetaBase {
  report: "sku";
  days: DayInfo[];
  grandTotalQty: number;
  rows: SkuRow[];
}

/* ---------- City ---------- */
export interface CityRow {
  ranking: number;
  region: string;
  cityName: string;
  salesMix: number;
  grandTotal: number;
  dailyAvg: number;
  daily: Record<string, number>;
  placeholders: {
    backendStock: null;
    frontendStock: null;
    totalSoh: null;
    sohCover: null;
  };
}
export interface CityReport extends ReportMetaBase {
  report: "city";
  days: DayInfo[];
  grandTotalQty: number;
  rows: CityRow[];
}
