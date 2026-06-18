-- =============================================================
-- SKU REPORT  —  unit MRP (list price) per SKU
-- =============================================================
-- `mrp` in raw_sales is a ROW TOTAL (= units x unit price), so the
-- real unit price is  mrp / quantity. The raw data has some bad rows
-- with wrong values, so we take the MOST COMMON unit price per SKU
-- (the "mode") rather than an average or max.
--
-- Parameters:
--   @from, @toExclusive, @platform   (same as the other queries)
--
-- Columns you MUST return (names matter): itemId, mrp
--   itemId = the SKU id   (sku_id)
--   mrp    = unit price   (most common mrp/quantity for that SKU)
-- =============================================================
WITH per_unit AS (
    SELECT
        CAST(sku_id AS varchar(50))                         AS itemId,
        ROUND(CAST(mrp AS float) / NULLIF(quantity, 0), 0)  AS unit_mrp,
        COUNT(*)                                            AS c
    FROM dbo.raw_sales
    WHERE order_date >= @from
      AND order_date <  @toExclusive
      AND sku_id IS NOT NULL
      AND quantity > 0
      AND mrp > 0
      AND (@platform IS NULL OR LOWER(platform) = LOWER(@platform))
    GROUP BY sku_id, ROUND(CAST(mrp AS float) / NULLIF(quantity, 0), 0)
),
ranked AS (
    SELECT itemId, unit_mrp,
           ROW_NUMBER() OVER (PARTITION BY itemId ORDER BY c DESC, unit_mrp ASC) AS rn
    FROM per_unit
)
SELECT itemId, unit_mrp AS mrp
FROM ranked
WHERE rn = 1;
