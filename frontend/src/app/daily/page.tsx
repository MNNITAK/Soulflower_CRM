"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { fetchDaily } from "@/lib/api";
import { useReport } from "@/hooks/useReport";
import { StatusBar, Loading, ErrorBox } from "@/components/ReportShell";
import DailyReportTable from "@/components/DailyReportTable";
import DailyAnalytics from "@/components/DailyAnalytics";
import { DEFAULT_PLATFORM } from "@/components/PlatformSelector";

function DailyView() {
  const sp = useSearchParams();
  const month = sp.get("month") ?? undefined;
  const platform = sp.get("platform") ?? DEFAULT_PLATFORM;
  const { data, loading, error } = useReport(
    () => fetchDaily({ month, platform }),
    `daily:${platform}:${month ?? "current"}`,
  );

  return (
    <div>
      <StatusBar
        title="Daily Report"
        range={data?.range}
        platform={data?.platform}
        strategy={data?.date1Strategy}
      />
      {loading && <Loading />}
      {error && <ErrorBox message={error} />}
      {data && (
        <>
          <DailyAnalytics data={data} />
          <DailyReportTable data={data} />
        </>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <DailyView />
    </Suspense>
  );
}
