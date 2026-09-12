"use client";

/** Ordinal blue ramp from the dataviz reference palette (step 250 -> 600). */
const RAMP = ["#86b6ef", "#5598e7", "#3987e5", "#256abf", "#1c5cab", "#184f95"];

interface Datum {
  label: string;
  value: number;
}

export function FunnelChart({ data }: { data: Datum[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-2">
      {data.map((d, i) => {
        const width = (d.value / max) * 100;
        const prev = i === 0 ? d.value : data[i - 1].value;
        const conv = prev ? Math.round((d.value / prev) * 100) : 100;
        return (
          <div key={d.label} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-right text-xs text-ink-500">
              {d.label}
            </span>
            <div className="flex-1">
              <div
                className="flex h-9 items-center justify-between rounded-md px-3 text-xs font-medium text-white transition-all"
                style={{
                  width: `${Math.max(width, 12)}%`,
                  backgroundColor: RAMP[i % RAMP.length],
                }}
              >
                <span className="tabular-nums">{d.value}</span>
              </div>
            </div>
            <span className="w-12 shrink-0 text-right text-[11px] tabular-nums text-ink-400">
              {i === 0 ? "—" : `${conv}%`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
