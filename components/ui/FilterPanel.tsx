"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { SelectOption } from "@/lib/types";
import { Select } from "./FormField";
import { Drawer } from "./Drawer";

export interface FilterConfig {
  key: string;
  label: string;
  options: SelectOption[];
  /** render as date input instead of select */
  type?: "select" | "date";
}

export type FilterValues = Record<string, string>;

interface Props {
  filters: FilterConfig[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  /** result count shown next to the header */
  resultLabel?: string;
}

function FilterControls({
  filters,
  values,
  onChange,
}: Omit<Props, "resultLabel">) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filters.map((f) => (
        <div key={f.key} className="flex flex-col gap-1">
          <label className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
            {f.label}
          </label>
          {f.type === "date" ? (
            <input
              type="date"
              value={values[f.key] ?? ""}
              onChange={(e) =>
                onChange({ ...values, [f.key]: e.target.value })
              }
              className="h-9 w-full rounded-lg border border-ink-300 bg-white px-3 text-sm text-ink-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          ) : (
            <Select
              value={values[f.key] ?? ""}
              onChange={(e) =>
                onChange({ ...values, [f.key]: e.target.value })
              }
              className="h-9"
            >
              <option value="">All</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          )}
        </div>
      ))}
    </div>
  );
}

export function FilterPanel({ filters, values, onChange, resultLabel }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeCount = Object.values(values).filter(Boolean).length;
  const clear = () =>
    onChange(Object.fromEntries(filters.map((f) => [f.key, ""])));

  return (
    <>
      {/* Desktop inline panel */}
      <div className="hidden rounded-xl border border-ink-200 bg-white p-4 shadow-sm lg:block">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink-800">
            <SlidersHorizontal className="h-4 w-4 text-ink-400" />
            Filters
            {activeCount > 0 && (
              <span className="rounded-full bg-brand-100 px-1.5 py-0.5 text-[11px] font-semibold text-brand-700">
                {activeCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {resultLabel && (
              <span className="text-xs text-ink-500">{resultLabel}</span>
            )}
            {activeCount > 0 && (
              <button
                onClick={clear}
                className="text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
        <FilterControls filters={filters} values={values} onChange={onChange} />
      </div>

      {/* Mobile trigger */}
      <div className="flex items-center justify-between lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-ink-300 bg-white px-3 text-sm font-medium text-ink-700 shadow-sm"
        >
          <SlidersHorizontal className="h-4 w-4 text-ink-400" />
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-brand-100 px-1.5 text-[11px] font-semibold text-brand-700">
              {activeCount}
            </span>
          )}
        </button>
        {resultLabel && (
          <span className="text-xs text-ink-500">{resultLabel}</span>
        )}
      </div>

      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        title="Filters"
        side="right"
        footer={
          <div className="flex w-full gap-3">
            <button
              onClick={clear}
              className="h-10 flex-1 rounded-lg border border-ink-300 text-sm font-medium text-ink-700"
            >
              Clear all
            </button>
            <button
              onClick={() => setMobileOpen(false)}
              className="h-10 flex-1 rounded-lg bg-brand-600 text-sm font-medium text-white"
            >
              Apply
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <FilterControls
            filters={filters}
            values={values}
            onChange={onChange}
          />
        </div>
      </Drawer>

      {/* Active filter chips */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters
            .filter((f) => values[f.key])
            .map((f) => (
              <span
                key={f.key}
                className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2.5 py-1 text-xs text-ink-700"
              >
                <span className="text-ink-400">{f.label}:</span>
                {f.options.find((o) => o.value === values[f.key])?.label ??
                  values[f.key]}
                <button
                  onClick={() => onChange({ ...values, [f.key]: "" })}
                  className="text-ink-400 hover:text-ink-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
        </div>
      )}
    </>
  );
}
