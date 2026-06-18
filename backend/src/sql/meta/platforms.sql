-- =============================================================
-- META  —  list of platforms (for the dashboard dropdown)
-- =============================================================
-- No parameters. Returns each platform ordered by total quantity.
-- Columns you MUST return (names matter): platform
-- =============================================================
SELECT platform,
       SUM(CAST(quantity AS bigint)) AS qty
FROM dbo.raw_sales
WHERE platform IS NOT NULL AND platform <> ''
GROUP BY platform
ORDER BY qty DESC;
