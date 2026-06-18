"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const TABS = [
  { href: "/daily", label: "Daily Report" },
  { href: "/sku", label: "SKU wise" },
  { href: "/city", label: "City wise" },
];

export default function TabNav() {
  const pathname = usePathname();
  const sp = useSearchParams();
  const query = sp.toString();
  const suffix = query ? `?${query}` : "";

  return (
    <nav className="flex gap-1 rounded-full bg-slate-100 p-1">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={`${t.href}${suffix}`}
            className={
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors " +
              (active
                ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900")
            }
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
