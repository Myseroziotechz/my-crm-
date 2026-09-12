"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Eye, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { SearchBar } from "@/components/ui/SearchBar";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RowActions } from "@/components/ui/RowActions";
import { FilterPanel, type FilterValues } from "@/components/ui/FilterPanel";
import { CallResultModal } from "@/components/calls/CallResultModal";
import {
  CALL_STATUSES,
  INTEREST_LEVELS,
  INDUSTRIES,
  toOptions,
} from "@/lib/constants";
import { formatDateTime, formatDuration } from "@/lib/utils";
import { calls, employees, leads } from "@/mock";
import type { Call, Column } from "@/lib/types";

function industryForLead(leadId: string) {
  return leads.find((l) => l.id === leadId)?.industry ?? "Other";
}

export default function CallsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FilterValues>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [logOpen, setLogOpen] = useState(false);

  const filterConfig = useMemo(
    () => [
      { key: "date", label: "Date", options: [], type: "date" as const },
      {
        key: "employee",
        label: "Employee",
        options: employees.map((e) => ({ label: e.name, value: e.name })),
      },
      { key: "status", label: "Call Status", options: toOptions(CALL_STATUSES) },
      {
        key: "interest",
        label: "Interest Level",
        options: toOptions(INTEREST_LEVELS),
      },
      { key: "industry", label: "Industry", options: toOptions(INDUSTRIES) },
    ],
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return calls.filter((c) => {
      if (
        q &&
        !`${c.companyName} ${c.contactName} ${c.employeeName} ${c.remarks}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      if (filters.date && c.date.slice(0, 10) !== filters.date) return false;
      if (filters.employee && c.employeeName !== filters.employee) return false;
      if (filters.status && c.status !== filters.status) return false;
      if (filters.interest && c.interest !== filters.interest) return false;
      if (
        filters.industry &&
        industryForLead(c.leadId) !== filters.industry
      )
        return false;
      return true;
    });
  }, [query, filters]);

  const pageCount = Math.ceil(filtered.length / pageSize);
  const safePage = Math.min(page, Math.max(1, pageCount));
  const rows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const columns: Column<Call>[] = [
    {
      key: "date",
      header: "Date",
      render: (c) => (
        <span className="whitespace-nowrap text-ink-600">
          {formatDateTime(c.date)}
        </span>
      ),
    },
    {
      key: "companyName",
      header: "Company",
      render: (c) => (
        <span className="font-medium text-ink-900">{c.companyName}</span>
      ),
    },
    { key: "contactName", header: "Contact", hideOnMobile: true },
    { key: "employeeName", header: "Employee", hideOnMobile: true },
    {
      key: "status",
      header: "Call Status",
      render: (c) => <StatusBadge kind="call" value={c.status} size="sm" />,
    },
    {
      key: "interest",
      header: "Interest",
      render: (c) =>
        c.interest ? (
          <StatusBadge kind="interest" value={c.interest} size="sm" dot={false} />
        ) : (
          <span className="text-ink-300">—</span>
        ),
    },
    {
      key: "duration",
      header: "Duration",
      align: "right",
      render: (c) => (
        <span className="tabular-nums text-ink-600">
          {formatDuration(c.duration)}
        </span>
      ),
    },
    {
      key: "remarks",
      header: "Remarks",
      hideOnMobile: true,
      render: (c) => (
        <span className="line-clamp-1 max-w-[220px] text-xs text-ink-500">
          {c.remarks}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (c) => (
        <RowActions
          actions={[
            {
              label: "View Lead",
              icon: Eye,
              onClick: () => router.push(`/leads/${c.leadId}`),
            },
            { label: "Log Follow-up Call", icon: RotateCcw, onClick: () => setLogOpen(true) },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Calls"
        description="Complete outbound call history across the team."
        actions={
          <Button icon={Phone} onClick={() => setLogOpen(true)}>
            Log Call
          </Button>
        }
      />

      <div className="space-y-4">
        <SearchBar
          value={query}
          onChange={(v) => {
            setQuery(v);
            setPage(1);
          }}
          placeholder="Search company, contact, remarks…"
          className="sm:max-w-md"
        />

        <FilterPanel
          filters={filterConfig}
          values={filters}
          onChange={(v) => {
            setFilters(v);
            setPage(1);
          }}
          resultLabel={`${filtered.length} call${filtered.length === 1 ? "" : "s"}`}
        />

        <Card className="overflow-hidden">
          <DataTable
            columns={columns}
            rows={rows}
            onRowClick={(c) => router.push(`/leads/${c.leadId}`)}
            mobileTitle={(c) => c.companyName}
            mobileSubtitle={(c) => `${formatDateTime(c.date)} · ${c.employeeName}`}
            emptyTitle="No calls found"
          />
          {filtered.length > 0 && (
            <Pagination
              page={safePage}
              pageSize={pageSize}
              total={filtered.length}
              onPageChange={setPage}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setPage(1);
              }}
            />
          )}
        </Card>
      </div>

      <CallResultModal open={logOpen} onClose={() => setLogOpen(false)} />
    </div>
  );
}
