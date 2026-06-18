"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { fetchPlatforms } from "@/lib/api";

export const DEFAULT_PLATFORM = "blinkit";

export default function PlatformSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const value = sp.get("platform") ?? DEFAULT_PLATFORM;

  const [platforms, setPlatforms] = useState<string[]>([]);

  useEffect(() => {
    fetchPlatforms()
      .then(setPlatforms)
      .catch(() => setPlatforms([]));
  }, []);

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(sp.toString());
    params.set("platform", e.target.value);
    router.push(`${pathname}?${params.toString()}`);
  }

  // Ensure the current value is selectable even before the list loads.
  const options =
    platforms.length > 0
      ? platforms
      : Array.from(new Set([value, DEFAULT_PLATFORM]));

  return (
    <label className="flex items-center gap-2 text-sm text-gray-600">
      <span>Platform</span>
      <select
        value={value}
        onChange={onChange}
        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm capitalize text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
      >
        {options.map((p) => (
          <option key={p} value={p} className="capitalize">
            {p}
          </option>
        ))}
      </select>
    </label>
  );
}
