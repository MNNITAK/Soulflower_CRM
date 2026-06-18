const intFmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const num2Fmt = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const pctFmt = new Intl.NumberFormat("en-IN", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export const fmtInt = (n: number | null | undefined): string =>
  n == null ? "—" : intFmt.format(n);

export const fmtNum2 = (n: number | null | undefined): string =>
  n == null ? "—" : num2Fmt.format(n);

export const fmtCurrency = (n: number | null | undefined): string =>
  n == null ? "—" : "₹" + intFmt.format(n);

export const fmtPct = (n: number | null | undefined): string =>
  n == null ? "—" : pctFmt.format(n);

/** color class for growth/% values */
export const growthClass = (n: number | null | undefined): string =>
  n == null ? "text-gray-400" : n > 0 ? "text-green-600" : n < 0 ? "text-red-600" : "text-gray-600";
