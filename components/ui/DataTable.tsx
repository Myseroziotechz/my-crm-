"use client";

import { cn } from "@/lib/utils";
import type { Column } from "@/lib/types";
import { EmptyState } from "./EmptyState";
import { TableLoadingState } from "./LoadingState";

interface Props<Row extends { id: string }> {
  columns: Column<Row>[];
  rows: Row[];
  loading?: boolean;
  onRowClick?: (row: Row) => void;
  /** Card title/subtitle for the mobile layout */
  mobileTitle?: (row: Row) => React.ReactNode;
  mobileSubtitle?: (row: Row) => React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}

function cell<Row>(col: Column<Row>, row: Row): React.ReactNode {
  if (col.render) return col.render(row);
  const v = (row as Record<string, unknown>)[col.key];
  return v === null || v === undefined || v === "" ? "—" : String(v);
}

export function DataTable<Row extends { id: string }>({
  columns,
  rows,
  loading,
  onRowClick,
  mobileTitle,
  mobileSubtitle,
  emptyTitle = "No records found",
  emptyDescription = "Try adjusting your search or filters.",
  emptyAction,
}: Props<Row>) {
  if (loading) return <TableLoadingState />;

  if (rows.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-ink-200 bg-ink-50/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-500",
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                        ? "text-center"
                        : "text-left",
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "transition-colors",
                  onRowClick && "cursor-pointer hover:bg-brand-50/40",
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-3 text-ink-700",
                      col.align === "right"
                        ? "text-right"
                        : col.align === "center"
                          ? "text-center"
                          : "text-left",
                      col.className,
                    )}
                  >
                    {cell(col, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="divide-y divide-ink-100 md:hidden">
        {rows.map((row) => (
          <div
            key={row.id}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={cn(
              "px-4 py-3.5",
              onRowClick && "cursor-pointer active:bg-ink-50",
            )}
          >
            {(mobileTitle || mobileSubtitle) && (
              <div className="mb-2">
                {mobileTitle && (
                  <div className="text-sm font-semibold text-ink-900">
                    {mobileTitle(row)}
                  </div>
                )}
                {mobileSubtitle && (
                  <div className="text-xs text-ink-500">
                    {mobileSubtitle(row)}
                  </div>
                )}
              </div>
            )}
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              {columns
                .filter((c) => !c.hideOnMobile)
                .map((col) => (
                  <div key={col.key} className="min-w-0">
                    <dt className="text-[10px] uppercase tracking-wide text-ink-400">
                      {col.header}
                    </dt>
                    <dd className="truncate text-xs text-ink-700">
                      {cell(col, row)}
                    </dd>
                  </div>
                ))}
            </dl>
          </div>
        ))}
      </div>
    </>
  );
}
