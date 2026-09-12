"use client";

import { useState } from "react";
import { CHART_COLORS } from "@/lib/constants";

interface Datum {
  label: string;
  value: number;
}

interface Props {
  data: Datum[];
  color?: string;
  height?: number;
  valueFormatter?: (v: number) => string;
}

export function LineChart({
  data,
  color = CHART_COLORS[0],
  height = 220,
  valueFormatter = (v) => String(v),
}: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.value), 1);
  const n = data.length;
  const x = (i: number) => (n === 1 ? 50 : (i / (n - 1)) * 100);
  const y = (v: number) => 100 - (v / max) * 90 - 5;

  const line = data.map((d, i) => `${x(i)},${y(d.value)}`).join(" ");
  const area = `0,100 ${line} 100,100`;

  return (
    <div className="relative" style={{ height }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible"
        onMouseLeave={() => setHover(null)}
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
        <defs>
          <linearGradient id="lc-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#lc-fill)" />
        <polyline
          points={line}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {data.map((d, i) => (
          <g key={d.label}>
            <rect
              x={x(i) - (100 / n) / 2}
              y={0}
              width={100 / n}
              height={100}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
            <circle
              cx={x(i)}
              cy={y(d.value)}
              r={hover === i ? 3 : 1.6}
              fill="#fff"
              stroke={color}
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            />
            {hover === i && (
              <line
                x1={x(i)}
                x2={x(i)}
                y1={0}
                y2={100}
                stroke={color}
                strokeWidth={1}
                strokeDasharray="2 2"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </g>
        ))}
      </svg>
      <div className="mt-1.5 flex justify-between text-[10px] text-ink-400">
        {data.map((d, i) => (
          <span key={d.label} className={i % 2 ? "opacity-0 sm:opacity-100" : ""}>
            {d.label}
          </span>
        ))}
      </div>
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-0 rounded-md bg-ink-900 px-2 py-1 text-[11px] font-medium text-white shadow-lg"
          style={{
            left: `${x(hover)}%`,
            transform: "translateX(-50%)",
          }}
        >
          {data[hover].label}: {valueFormatter(data[hover].value)}
        </div>
      )}
    </div>
  );
}
