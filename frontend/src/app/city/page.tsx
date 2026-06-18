"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { fetchCity } from "@/lib/api";
import { useReport } from "@/hooks/useReport";
import { StatusBar, Loading, ErrorBox } from "@/components/ReportShell";
import CityReportTable from "@/components/CityReportTable";
import CityAnalytics from "@/components/CityAnalytics";
import { DEFAULT_PLATFORM } from "@/components/PlatformSelector";
import { fmtInt } from "@/lib/format";

function CityView() {
  const sp = useSearchParams();
  const month = sp.get("month") ?? undefined;
  const platform = sp.get("platform") ?? DEFAULT_PLATFORM;
  const { data, loading, error } = useReport(
    () => fetchCity({ month, platform }),
    `city:${platform}:${month ?? "current"}`,
  );

  return (
    <div>
      <StatusBar
        title="City wise Sales Report (Top 50)"
        range={data?.range}
        platform={data?.platform}
        strategy={data?.date1Strategy}
        extra={data ? `grand total ${fmtInt(data.grandTotalQty)}` : undefined}
      />
      {loading && <Loading />}
      {error && <ErrorBox message={error} />}
      {data && (
        <>
          <CityAnalytics data={data} />
          <CityReportTable data={data} />
        </>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <CityView />
    </Suspense>
  );
}
