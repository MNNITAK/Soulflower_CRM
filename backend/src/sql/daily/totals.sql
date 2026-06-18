-- =============================================================
-- DAILY REPORT  —  one row per day
-- =============================================================
-- Returns total quantity and total MRP value for each day.
-- This same query is run twice by the app: once for the selected
-- month, and once for the previous month (to compute growth %).
--
-- Available parameters (the app fills these in for you):
--   @from         start date  (inclusive)  e.g. '2026-06-01'
--   @toExclusive  end date     (exclusive)  e.g. '2026-07-01'
--   @platform     platform name, or NULL for "all platforms"
--
-- Columns you MUST return (names matter): d, qty, mrpValue
--   d        = the day            (a real date)
--   qty      = units sold         SUM(quantity)
--   mrpValue = total MRP value    SUM(mrp)   <- mrp is already a row total
-- =============================================================
SELECT
    CAST(order_date AS date)        AS d,
    SUM(CAST(quantity AS bigint))   AS qty,
    SUM(CAST(mrp AS float))         AS mrpValue
FROM dbo.raw_sales
WHERE order_date >= @from
  AND order_date <  @toExclusive
  AND (@platform IS NULL OR LOWER(platform) = LOWER(@platform))
GROUP BY CAST(order_date AS date)
ORDER BY CAST(order_date AS date);
