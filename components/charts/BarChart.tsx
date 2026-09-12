"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CHART_COLORS } from "@/lib/constants";

interface Datum {
  label: string;
  value: number;
}

interface Props {
  data: Datum[];
  /** vertical columns or horizontal bars */
  orientation?: "vertical" | "horizontal";
  color?: string;
  /** color each bar from the categorical palette */
  multicolor?: boolean;
  valueFormatter?: (v: number) => string;
  height?: number;
}

export function BarChart({
  data,
  orientation = "vertical",
  color = CHART_COLORS[0],
  multicolor = false,
  valueFormatter = (v) => String(v),
  height = 220,
}: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.value), 1);

  if (orientation === "horizontal") {
    return (
      <div className="space-y-2.5">
        {data.map((d, i) => (
          <div
            key={d.label}
            className="group flex items-center gap-3"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <span className="w-28 shrink-0 truncate text-right text-xs text-ink-500">
              {d.label}
            </span>
            <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-ink-100">
              <div
                className="h-full rounded-md transition-all"
                style={{
                  width: `${(d.value / max) * 100}%`,
                  backgroundColor: multicolor
                    ? CHART_COLORS[i % CHART_COLORS.length]
                    : color,
                  opacity: hover === null || hover === i ? 1 : 0.55,
                }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-xs font-medium tabular-nums text-ink-700">
              {valueFormatter(d.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  const barW = 100 / data.length;
  return (
    <div className="relative" style={{ height }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible"
      >
        {[0, 25, 50, 75, 100].map((g) => (
          <line
            key={g}
            x1={0}
            x2={100}
            y1={g}
            y2={g}
            stroke="#e1e0d9"
            strokeWidth={0.3}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {data.map((d, i) => {
          const h = (d.value / max) * 92;
          return (
            <rect
              key={d.label}
              x={i * barW + barW * 0.2}
              y={100 - h}
              width={barW * 0.6}
              height={h}
              rx={1}
              fill={
                multicolor ? CHART_COLORS[i % CHART_COLORS.length] : color
              }
              opacity={hover === null || hover === i ? 1 : 0.5}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          );
        })}
      </svg>
      <div className="mt-1.5 flex justify-between">
        {data.map((d, i) => (
          <span
            key={d.label}
            className={cn(
              "flex-1 truncate text-center text-[10px]",
              hover === i ? "font-semibold text-ink-800" : "text-ink-400",
            )}
          >
            {d.label}
          </span>
        ))}
      </div>
      {hover !== null && (
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 rounded-md bg-ink-900 px-2 py-1 text-[11px] font-medium text-white shadow-lg">
          {data[hover].label}: {valueFormatter(data[hover].value)}
        </div>
      )}
    </div>
  );
}
