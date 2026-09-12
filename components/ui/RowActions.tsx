"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RowAction {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
}

export function RowActions({ actions }: { actions: RowAction[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
        aria-label="Row actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-ink-200 bg-white py-1 shadow-lg">
          {actions.map((a) => {
            const content = (
              <>
                {a.icon && <a.icon className="h-4 w-4 text-ink-400" />}
                {a.label}
              </>
            );
            const className = cn(
              "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm",
              a.danger
                ? "text-rose-600 hover:bg-rose-50"
                : "text-ink-600 hover:bg-ink-50",
            );
            return a.href ? (
              <a key={a.label} href={a.href} className={className}>
                {content}
              </a>
            ) : (
              <button
                key={a.label}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  a.onClick?.();
                }}
                className={className}
              >
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
