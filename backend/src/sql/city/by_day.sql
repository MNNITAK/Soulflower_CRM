-- =============================================================
-- CITY REPORT  —  one row per city per day
-- =============================================================
-- The app groups by city, spreads days into columns, ranks cities
-- by total quantity and keeps the top 50.
--
-- Junk rows (city = '0', '0.0', '' or NULL) are excluded here.
--
-- Parameters:
--   @from, @toExclusive, @platform
--
-- Columns you MUST return (names matter): cityName, region, d, qty
--   cityName = city name   (city)
--   region   = region name (region)
--   d        = the day     (a real date)
--   qty      = units sold  SUM(quantity)
-- =============================================================
SELECT
    city                            AS cityName,
    MAX(region)                     AS region,
    CAST(order_date AS date)        AS d,
    SUM(CAST(quantity AS bigint))   AS qty
FROM dbo.raw_sales
WHERE order_date >= @from
  AND order_date <  @toExclusive
  AND city IS NOT NULL
  AND city NOT IN ('0', '0.0', '')
  AND (@platform IS NULL OR LOWER(platform) = LOWER(@platform))
GROUP BY city, CAST(order_date AS date)
ORDER BY city;
