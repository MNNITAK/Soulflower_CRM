"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function MonthSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const value = sp.get("month") ?? currentMonth();

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const params = new URLSearchParams(sp.toString());
    if (e.target.value) params.set("month", e.target.value);
    else params.delete("month");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-sm text-gray-600">
      <span>Month</span>
      <input
        type="month"
        value={value}
        onChange={onChange}
        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
      />
    </label>
  );
}
