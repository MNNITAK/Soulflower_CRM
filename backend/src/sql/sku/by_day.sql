-- =============================================================
-- SKU REPORT  —  one row per SKU per day
-- =============================================================
-- The app groups these rows by SKU and spreads the days into
-- columns, then computes ranking / mix % / daily average.
--
-- Parameters:
--   @from         start date (inclusive)
--   @toExclusive  end date   (exclusive)
--   @platform     platform name, or NULL for all platforms
--
-- Columns you MUST return (names matter): itemId, itemName, d, qty
--   itemId   = the SKU id          (sku_id)
--   itemName = product name        (product_name)
--   d        = the day             (a real date)
--   qty      = units sold that day SUM(quantity)
-- =============================================================
SELECT
    CAST(sku_id AS varchar(50))     AS itemId,
    MAX(product_name)               AS itemName,
    CAST(order_date AS date)        AS d,
    SUM(CAST(quantity AS bigint))   AS qty
FROM dbo.raw_sales
WHERE order_date >= @from
  AND order_date <  @toExclusive
  AND sku_id IS NOT NULL
  AND (@platform IS NULL OR LOWER(platform) = LOWER(@platform))
GROUP BY sku_id, CAST(order_date AS date)
ORDER BY sku_id;
