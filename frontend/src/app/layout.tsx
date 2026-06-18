import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import TabNav from "@/components/TabNav";
import MonthSelector from "@/components/MonthSelector";
import PlatformSelector from "@/components/PlatformSelector";
import HeaderTitle from "@/components/HeaderTitle";

export const metadata: Metadata = {
  title: "Soulflower — Sales Dashboard",
  description: "Daily, SKU-wise and City-wise sales reports from raw_sales.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-blue-50/50 via-white to-slate-50">
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-5 py-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-sm">
                S
              </span>
              <span className="text-lg font-semibold tracking-tight text-slate-800">
                Soulflower
              </span>
              <Suspense fallback={null}>
                <HeaderTitle />
              </Suspense>
            </div>
            <Suspense fallback={<div className="h-8" />}>
              <TabNav />
            </Suspense>
            <div className="flex items-center gap-4">
              <Suspense fallback={<div className="h-8" />}>
                <PlatformSelector />
              </Suspense>
              <Suspense fallback={<div className="h-8" />}>
                <MonthSelector />
              </Suspense>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1600px] px-5 py-6">{children}</main>
      </body>
    </html>
  );
}
