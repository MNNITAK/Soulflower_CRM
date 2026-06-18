"use client";

import React from "react";

/* ---------- shared ---------- */

export const PALETTE = [
  "#2563eb", "#0ea5e9", "#6366f1", "#06b6d4",
  "#8b5cf6", "#3b82f6", "#14b8a6", "#a855f7",
];

export function ChartCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "rounded-xl border border-slate-200 bg-white p-4 shadow-sm " + className
      }
    >
      <h3 className="mb-3 text-sm font-semibold text-slate-700">{title}</h3>
      {children}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "up" | "down";
}) {
  const subTone =
    tone === "up"
      ? "text-emerald-600"
      : tone === "down"
        ? "text-red-600"
        : "text-slate-400";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-800">
        {value}
      </div>
      {sub && <div className={"mt-0.5 text-xs font-medium " + subTone}>{sub}</div>}
    </div>
  );
}

/* ---------- vertical trend (bars + optional comparison line) ---------- */

export interface TrendPoint {
  label: string; // x label (e.g. day of month)
  value: number; // current
  compare?: number; // prior
  title?: string; // hover text
}

export function TrendChart({ data }: { data: TrendPoint[] }) {
  const W = 900;
  const H = 220;
  const padX = 8;
  const padTop = 12;
  const padBottom = 22;
  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;

  const max = Math.max(
    1,
    ...data.map((d) => Math.max(d.value, d.compare ?? 0)),
  );
  const n = data.length || 1;
  const step = innerW / n;
  const barW = Math.max(2, step * 0.6);

  const y = (v: number) => padTop + innerH - (v / max) * innerH;
  const x = (i: number) => padX + i * step + (step - barW) / 2;

  const comparePts = data
    .map((d, i) =>
      d.compare == null ? null : `${padX + i * step + step / 2},${y(d.compare)}`,
    )
    .filter(Boolean)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      {/* baseline */}
      <line
        x1={padX}
        y1={padTop + innerH}
        x2={W - padX}
        y2={padTop + innerH}
        stroke="#e2e8f0"
      />
      {data.map((d, i) => (
        <g key={i}>
          <rect
            x={x(i)}
            y={y(d.value)}
            width={barW}
            height={padTop + innerH - y(d.value)}
            rx={2}
            fill="url(#barGrad)"
          >
            <title>{d.title ?? `${d.label}: ${d.value}`}</title>
          </rect>
          {(i % Math.ceil(n / 16) === 0 || n <= 16) && (
            <text
              x={padX + i * step + step / 2}
              y={H - 6}
              textAnchor="middle"
              className="fill-slate-400"
              fontSize="10"
            >
              {d.label}
            </text>
          )}
        </g>
      ))}
      {comparePts && (
        <polyline
          points={comparePts}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
      )}
    </svg>
  );
}

/* ---------- horizontal ranked bars ---------- */

export interface RankItem {
  label: string;
  value: number;
}

export function RankBars({
  data,
  valueFmt,
}: {
  data: RankItem[];
  valueFmt: (n: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-1.5">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="w-32 shrink-0 truncate text-slate-600" title={d.label}>
            {d.label}
          </div>
          <div className="relative h-5 flex-1 overflow-hidden rounded bg-slate-100">
            <div
              className="h-full rounded bg-gradient-to-r from-blue-500 to-indigo-500"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
          <div className="w-16 shrink-0 text-right font-medium tabular-nums text-slate-700">
            {valueFmt(d.value)}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- donut ---------- */

export interface DonutSlice {
  label: string;
  value: number;
}

function arc(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const p = (a: number) => [
    cx + r * Math.cos((a - 90) * (Math.PI / 180)),
    cy + r * Math.sin((a - 90) * (Math.PI / 180)),
  ];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
}

export function Donut({
  data,
  valueFmt,
}: {
  data: DonutSlice[];
  valueFmt: (n: number) => string;
}) {
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  let angle = 0;
  const cx = 60,
    cy = 60,
    r = 46;
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 120 120" width="120" height="120" className="shrink-0">
        {data.map((d, i) => {
          const a0 = angle;
          const a1 = angle + (d.value / total) * 360;
          angle = a1;
          return (
            <path
              key={i}
              d={arc(cx, cy, r, a0, Math.min(a1, a0 + 359.999))}
              fill="none"
              stroke={PALETTE[i % PALETTE.length]}
              strokeWidth="14"
              strokeLinecap="butt"
            >
              <title>{`${d.label}: ${valueFmt(d.value)}`}</title>
            </path>
          );
        })}
        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          className="fill-slate-700"
          fontSize="13"
          fontWeight="600"
        >
          {valueFmt(total)}
        </text>
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          className="fill-slate-400"
          fontSize="9"
        >
          total
        </text>
      </svg>
      <div className="space-y-1 text-xs">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: PALETTE[i % PALETTE.length] }}
            />
            <span className="text-slate-600">{d.label}</span>
            <span className="font-medium text-slate-700">
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
