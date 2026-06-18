export type Date1Strategy = "NATIVE_DATE" | "EXCEL_SERIAL" | "STRING_DATE";

export interface DayInfo {
  date: string;
  dayOfMonth: number;
  dow: string;
}

export interface RangeMeta {
  from: string;
  to: string;
}

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
}

export interface DailyReport {
  report: "daily";
  range: RangeMeta;
  prior: RangeMeta;
  platform: string | null;
  date1Strategy: Date1Strategy;
  generatedAt: string;
  rows: DailyRow[];
  totals: { current: DailyMetric; prior: DailyMetric | null };
}

export interface SkuRow {
  ranking: number;
  skuId: string;
  productName: string;
  mrp: number;
  salesMix: number;
  grandTotal: number;
  dailyAvg: number;
  daily: Record<string, number>;
}

export interface SkuReport {
  report: "sku";
  range: RangeMeta;
  platform: string | null;
  date1Strategy: Date1Strategy;
  generatedAt: string;
  days: DayInfo[];
  grandTotalQty: number;
  rows: SkuRow[];
}

export interface CityRow {
  ranking: number;
  region: string;
  cityName: string;
  salesMix: number;
  grandTotal: number;
  dailyAvg: number;
  daily: Record<string, number>;
}

export interface CityReport {
  report: "city";
  range: RangeMeta;
  platform: string | null;
  date1Strategy: Date1Strategy;
  generatedAt: string;
  days: DayInfo[];
  grandTotalQty: number;
  rows: CityRow[];
}
