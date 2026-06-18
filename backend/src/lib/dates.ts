/**
 * Date helpers. All date math is done in UTC and dates are represented as
 * 'YYYY-MM-DD' strings to avoid timezone drift.
 */

const DOW = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

export interface DayInfo {
  /** 'YYYY-MM-DD' — the pivot key */
  date: string;
  /** day of month, 1..31 */
  dayOfMonth: number;
  /** 'MON' | 'TUE' | ... */
  dow: string;
}

export interface DateRange {
  /** inclusive start 'YYYY-MM-DD' */
  from: string;
  /** exclusive end 'YYYY-MM-DD' (the day after the last included day) */
  toExclusive: string;
  /** number of days in the range */
  days: number;
}

function toUTC(y: number, m0: number, d: number): Date {
  return new Date(Date.UTC(y, m0, d));
}

export function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parse(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return toUTC(y, m - 1, d);
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * 86400000);
}

function lastDayOfMonth(y: number, m0: number): number {
  return new Date(Date.UTC(y, m0 + 1, 0)).getUTCDate();
}

/** Today in UTC as 'YYYY-MM-DD'. */
function today(): string {
  return fmt(new Date());
}

/**
 * Resolve a reporting range.
 * - explicit `from`+`to` (inclusive) wins
 * - else `month` = 'YYYY-MM' → 1st .. min(today, month end)
 * - else current month → 1st .. today
 */
export function resolveRange(opts: {
  month?: string;
  from?: string;
  to?: string;
}): DateRange {
  if (opts.from && opts.to) {
    const start = parse(opts.from);
    const endIncl = parse(opts.to);
    const toExclusive = addDays(endIncl, 1);
    return {
      from: fmt(start),
      toExclusive: fmt(toExclusive),
      days: Math.round((toExclusive.getTime() - start.getTime()) / 86400000),
    };
  }

  const todayStr = today();
  let year: number;
  let month0: number;
  if (opts.month) {
    const [y, m] = opts.month.split("-").map(Number);
    year = y;
    month0 = m - 1;
  } else {
    const t = parse(todayStr);
    year = t.getUTCFullYear();
    month0 = t.getUTCMonth();
  }

  const start = toUTC(year, month0, 1);
  const monthEnd = toUTC(year, month0, lastDayOfMonth(year, month0));
  const todayDate = parse(todayStr);
  // MTD: cap at today if the requested month is the current/future month.
  const endIncl = todayDate < monthEnd ? todayDate : monthEnd;
  // If the month is entirely in the past, endIncl = monthEnd (todayDate>=monthEnd).
  const effectiveEnd = endIncl < start ? start : endIncl;
  const toExclusive = addDays(effectiveEnd, 1);

  return {
    from: fmt(start),
    toExclusive: fmt(toExclusive),
    days: Math.round((toExclusive.getTime() - start.getTime()) / 86400000),
  };
}

/**
 * Prior comparison period: the previous calendar month, same number of days,
 * starting on the same day-of-month as `range.from` (capped at the previous
 * month's length). Mirrors the workbook (Jun 1–16 ↔ May 1–16).
 */
export function priorPeriod(range: DateRange): DateRange {
  const start = parse(range.from);
  const y = start.getUTCFullYear();
  const m0 = start.getUTCMonth();
  const startDay = start.getUTCDate();

  const prevM0 = m0 === 0 ? 11 : m0 - 1;
  const prevY = m0 === 0 ? y - 1 : y;
  const prevLen = lastDayOfMonth(prevY, prevM0);

  const priorStartDay = Math.min(startDay, prevLen);
  const priorStart = toUTC(prevY, prevM0, priorStartDay);
  // same day-count, capped at the previous month's end
  let priorEndIncl = addDays(priorStart, range.days - 1);
  const prevMonthEnd = toUTC(prevY, prevM0, prevLen);
  if (priorEndIncl > prevMonthEnd) priorEndIncl = prevMonthEnd;
  const toExclusive = addDays(priorEndIncl, 1);

  return {
    from: fmt(priorStart),
    toExclusive: fmt(toExclusive),
    days: Math.round((toExclusive.getTime() - priorStart.getTime()) / 86400000),
  };
}

/** List every day in the range as DayInfo (drives pivot columns / daily rows). */
export function dayList(range: DateRange): DayInfo[] {
  const out: DayInfo[] = [];
  let cur = parse(range.from);
  const end = parse(range.toExclusive);
  while (cur < end) {
    out.push({
      date: fmt(cur),
      dayOfMonth: cur.getUTCDate(),
      dow: DOW[cur.getUTCDay()],
    });
    cur = addDays(cur, 1);
  }
  return out;
}
