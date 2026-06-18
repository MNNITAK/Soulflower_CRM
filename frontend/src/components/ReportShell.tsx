"use client";

import type { Date1Strategy, RangeMeta } from "@/lib/types";

export function StatusBar({
  title,
  range,
  platform,
  strategy,
  extra,
}: {
  title: string;
  range?: RangeMeta;
  platform?: string | null;
  strategy?: Date1Strategy;
  extra?: string;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
      <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
        {platform && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 font-medium capitalize text-blue-700">
            {platform}
          </span>
        )}
        {range && (
          <span>
            Period: <b className="text-gray-700">{range.from}</b> →{" "}
            <b className="text-gray-700">{range.to}</b>
          </span>
        )}
        {extra && <span>{extra}</span>}
        {strategy && (
          <span className="rounded bg-gray-100 px-1.5 py-0.5">
            date1: {strategy}
          </span>
        )}
      </div>
    </div>
  );
}

export function Loading() {
  return (
    <div className="flex h-64 items-center justify-center text-gray-400">
      Loading report…
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <div className="font-semibold">Could not load report</div>
      <div className="mt-1">{message}</div>
      <div className="mt-2 text-xs text-red-500">
        Check that the backend is running (http://localhost:4000) and that
        backend/.env has valid Azure SQL credentials.
      </div>
    </div>
  );
}
