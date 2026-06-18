import type { DailyReport, SkuReport, CityReport } from "./types";

const BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:4000";

export interface ReportParams {
  month?: string;
  from?: string;
  to?: string;
  platform?: string;
}

function qs(params: ReportParams): string {
  const sp = new URLSearchParams();
  if (params.month) sp.set("month", params.month);
  if (params.from) sp.set("from", params.from);
  if (params.to) sp.set("to", params.to);
  if (params.platform) sp.set("platform", params.platform);
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export async function fetchPlatforms(): Promise<string[]> {
  const data = await get<{ platforms: string[] }>("/api/platforms");
  return data.platforms;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.message || body?.error || "";
    } catch {
      /* ignore */
    }
    throw new Error(
      `Request failed (${res.status})${detail ? `: ${detail}` : ""}`,
    );
  }
  return res.json() as Promise<T>;
}

export const fetchDaily = (p: ReportParams = {}) =>
  get<DailyReport>(`/api/reports/daily${qs(p)}`);
export const fetchSku = (p: ReportParams = {}) =>
  get<SkuReport>(`/api/reports/sku${qs(p)}`);
export const fetchCity = (p: ReportParams = {}) =>
  get<CityReport>(`/api/reports/city${qs(p)}`);
