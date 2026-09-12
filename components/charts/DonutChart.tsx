"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CHART_COLORS } from "@/lib/constants";

interface Datum {
  label: string;
  value: number;
  color?: string;
}

interface Props {
  data: Datum[];
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({ data, centerLabel, centerValue }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const rawTotal = data.reduce((s, d) => s + d.value, 0);
  const total = rawTotal || 1; // avoid divide-by-zero in the arc math below
  const radius = 15.9155; // circumference = 100
  let offset = 0;

  const segments = data.map((d, i) => {
    const pct = (d.value / total) * 100;
    const seg = {
      pct,
      offset,
      color: d.color ?? CHART_COLORS[i % CHART_COLORS.length],
      ...d,
    };
    offset += pct;
    return seg;
  });

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-around">
      <div className="relative h-40 w-40 shrink-0">
        <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="4"
          />
          {segments.map((s, i) => (
            <circle
              key={s.label}
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={hover === i ? 5 : 4}
              strokeDasharray={`${s.pct} ${100 - s.pct}`}
              strokeDashoffset={-s.offset}
              className="transition-all"
              opacity={hover === null || hover === i ? 1 : 0.4}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-semibold text-ink-900">
            {hover !== null ? data[hover].value : centerValue ?? rawTotal}
          </span>
          <span className="max-w-[5rem] truncate text-[10px] text-ink-400">
            {hover !== null ? data[hover].label : centerLabel ?? "Total"}
          </span>
        </div>
      </div>

      <ul className="grid w-full max-w-xs grid-cols-1 gap-1.5">
        {segments.map((s, i) => (
          <li
            key={s.label}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            className={cn(
              "flex items-center justify-between gap-3 rounded-md px-2 py-1 text-xs transition-colors",
              hover === i ? "bg-ink-50" : "",
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: s.color }}
              />
              <span className="truncate text-ink-600">{s.label}</span>
            </span>
            <span className="shrink-0 tabular-nums font-medium text-ink-800">
              {s.value}
              <span className="ml-1 font-normal text-ink-400">
                {Math.round(s.pct)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
