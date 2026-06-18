# SQL queries — edit these to change report data

Every report's data comes from a plain `.sql` file in this folder. **You can edit
these files without touching any Node.js / TypeScript code.** Save the file,
refresh the dashboard, and your changes are live (no restart needed).

```
sql/
├─ daily/
│  └─ totals.sql        Daily report: totals per day
├─ sku/
│  ├─ by_day.sql        SKU report: quantity per SKU per day
│  └─ mrp_mode.sql      SKU report: unit MRP (list price) per SKU
├─ city/
│  └─ by_day.sql        City report: quantity per city per day
└─ meta/
   └─ platforms.sql     Dropdown: list of platforms
```

## How parameters work

The app passes values into the queries using `@name` placeholders. **Do not**
paste raw values into the SQL — always use the placeholder (this is safe against
SQL injection). The available parameters are:

| Parameter | Meaning | Example |
|---|---|---|
| `@from` | start date, inclusive | `'2026-06-01'` |
| `@toExclusive` | end date, exclusive (the day AFTER the last day) | `'2026-07-01'` |
| `@platform` | platform name, or `NULL` = all platforms | `'blinkit'` |

The platform filter is always written like this so one query handles both
"a specific platform" and "all platforms":

```sql
AND (@platform IS NULL OR LOWER(platform) = LOWER(@platform))
```

## Important: keep the output column names

Each file lists the column names it **must** return (e.g. `d, qty, mrpValue`).
The app reads results by these names, so if you rename a column with `AS`, keep
the required name. You can freely change the maths, filters, `WHERE` conditions,
`GROUP BY`, etc.

## The `raw_sales` columns you can use

`id, platform, kam, order_date, day_name, day_number, week_number, month_year,
quarter, sku_id, ean_code, product_name, product, category, platform_category,
quantity, mrp, nsv, city, state_name, region, uploaded_at, source_file`

> Note: `mrp` is a **row total** (units × unit price), not a unit price.
> So daily MRP value = `SUM(mrp)`, and unit price = `mrp / quantity`.
