"use client";

import { useEffect, useState } from "react";

export interface ReportState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/** Generic client fetch with loading/error state, re-run when `key` changes. */
export function useReport<T>(
  fetcher: () => Promise<T>,
  key: string,
): ReportState<T> {
  const [state, setState] = useState<ReportState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcher()
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (active)
          setState({
            data: null,
            loading: false,
            error: err instanceof Error ? err.message : String(err),
          });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}
