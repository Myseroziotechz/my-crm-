"use client";

import { cn } from "@/lib/utils";

interface Props {
  tabs: { key: string; label: string; count?: number }[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className }: Props) {
  return (
    <div
      className={cn(
        "flex gap-1 overflow-x-auto border-b border-ink-200",
        className,
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            "relative whitespace-nowrap px-3.5 py-2.5 text-sm font-medium transition-colors",
            active === tab.key
              ? "text-brand-700"
              : "text-ink-500 hover:text-ink-800",
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                "ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                active === tab.key
                  ? "bg-brand-100 text-brand-700"
                  : "bg-ink-100 text-ink-500",
              )}
            >
              {tab.count}
            </span>
          )}
          {active === tab.key && (
            <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-600" />
          )}
        </button>
      ))}
    </div>
  );
}
