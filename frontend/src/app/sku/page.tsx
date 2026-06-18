"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { fetchSku } from "@/lib/api";
import { useReport } from "@/hooks/useReport";
import { StatusBar, Loading, ErrorBox } from "@/components/ReportShell";
import SkuReportTable from "@/components/SkuReportTable";
import SkuAnalytics from "@/components/SkuAnalytics";
import { DEFAULT_PLATFORM } from "@/components/PlatformSelector";
import { fmtInt } from "@/lib/format";

function SkuView() {
  const sp = useSearchParams();
  const month = sp.get("month") ?? undefined;
  const platform = sp.get("platform") ?? DEFAULT_PLATFORM;
  const { data, loading, error } = useReport(
    () => fetchSku({ month, platform }),
    `sku:${platform}:${month ?? "current"}`,
  );

  return (
    <div>
      <StatusBar
        title="SKU wise Sales Report"
        range={data?.range}
        platform={data?.platform}
        strategy={data?.date1Strategy}
        extra={
          data ? `${data.rows.length} SKUs · grand total ${fmtInt(data.grandTotalQty)}` : undefined
        }
      />
      {loading && <Loading />}
      {error && <ErrorBox message={error} />}
      {data && (
        <>
          <SkuAnalytics data={data} />
          <SkuReportTable data={data} />
        </>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <SkuView />
    </Suspense>
  );
}
