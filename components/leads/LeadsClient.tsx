"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Upload, Download, Eye, Pencil, Phone, CalendarPlus } from "lucide-react";
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
import { AddFollowUpModal } from "@/components/followups/AddFollowUpModal";
import { ImportLeadsModal } from "@/components/leads/ImportLeadsModal";
import {
  INDUSTRIES,
  LEAD_STATUSES,
  INTEREST_LEVELS,
  LEAD_SOURCES,
  CITIES,
  toOptions,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { toCsv, downloadCsv, type CsvColumn } from "@/lib/csv";
import type { Column, Lead } from "@/lib/types";
import type { CompanyOption, EmployeeOption } from "@/lib/supabase/queries";

const EXPORT_COLUMNS: CsvColumn<Lead>[] = [
  { key: "companyName", label: "Company Name", value: (l) => l.companyName },
  { key: "contactName", label: "Contact Name", value: (l) => l.contactName },
  { key: "designation", label: "Designation", value: (l) => l.designation },
  { key: "industry", label: "Industry", value: (l) => l.industry },
  { key: "phone", label: "Phone", value: (l) => l.phone },
  { key: "email", label: "Email", value: (l) => l.email },
  { key: "website", label: "Website", value: (l) => l.website },
  { key: "city", label: "City", value: (l) => l.city },
  { key: "state", label: "State", value: (l) => l.state },
  { key: "status", label: "Status", value: (l) => l.status },
  { key: "interest", label: "Interest", value: (l) => l.interest },
  { key: "source", label: "Source", value: (l) => l.source },
  { key: "priority", label: "Priority", value: (l) => l.priority },
  { key: "assignedTo", label: "Assigned To", value: (l) => l.assignedTo },
  { key: "value", label: "Value", value: (l) => l.value },
  { key: "createdDate", label: "Created Date", value: (l) => l.createdDate },
  { key: "lastContact", label: "Last Contact", value: (l) => l.lastContact },
  { key: "nextFollowUp", label: "Next Follow-up", value: (l) => l.nextFollowUp },
  { key: "notes", label: "Notes", value: (l) => l.notes },
];

const PAGE_SIZE_DEFAULT = 10;

interface Props {
  leads: Lead[];
  companies: CompanyOption[];
  employees: EmployeeOption[];
}

export function LeadsClient({ leads, companies, employees }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FilterValues>(() => {
    const status = searchParams.get("status");
    const initial: FilterValues = {};
    if (status) initial.status = status;
    return initial;
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT);
  const [callLead, setCallLead] = useState<Lead | null>(null);
  const [followUpLead, setFollowUpLead] = useState<Lead | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const filterConfig = useMemo(
    () => [
      { key: "industry", label: "Industry", options: toOptions(INDUSTRIES) },
      {
        key: "company",
        label: "Company",
        options: companies.map((c) => ({ label: c.name, value: c.name })),
      },
      { key: "city", label: "City", options: toOptions(CITIES) },
      { key: "status", label: "Lead Status", options: toOptions(LEAD_STATUSES) },
      {
        key: "interest",
        label: "Interest Level",
        options: toOptions(INTEREST_LEVELS),
      },
      {
        key: "assignee",
        label: "Assigned Employee",
        options: employees.map((e) => ({ label: e.name, value: e.name })),
      },
      { key: "source", label: "Lead Source", options: toOptions(LEAD_SOURCES) },
      { key: "from", label: "Created After", options: [], type: "date" as const },
      {
        key: "followUp",
        label: "Follow-up Date",
        options: [],
        type: "date" as const,
      },
    ],
    [companies, employees],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (
        q &&
        !`${l.companyName} ${l.contactName} ${l.phone} ${l.id}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      if (filters.industry && l.industry !== filters.industry) return false;
      if (filters.company && l.companyName !== filters.company) return false;
      if (filters.city && l.city !== filters.city) return false;
      if (filters.status && l.status !== filters.status) return false;
      if (filters.interest && l.interest !== filters.interest) return false;
      if (filters.assignee && l.assignedTo !== filters.assignee) return false;
      if (filters.source && l.source !== filters.source) return false;
      if (filters.from && l.createdDate < filters.from) return false;
      if (filters.followUp && l.nextFollowUp !== filters.followUp) return false;
      return true;
    });
  }, [leads, query, filters]);

  const exportLeads = () => {
    const csv = toCsv(filtered, EXPORT_COLUMNS);
    downloadCsv(`leads-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const pageCount = Math.ceil(filtered.length / pageSize);
  const safePage = Math.min(page, Math.max(1, pageCount));
  const pageRows = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const columns: Column<Lead>[] = [
    {
      key: "id",
      header: "Lead ID",
      render: (l) => (
        <span className="font-mono text-xs text-ink-500">{l.id.slice(0, 8)}</span>
      ),
    },
    {
      key: "companyName",
      header: "Company",
      render: (l) => (
        <span className="font-medium text-ink-900">{l.companyName}</span>
      ),
    },
    {
      key: "contactName",
      header: "Contact",
      render: (l) => (
        <div>
          <div className="text-ink-800">{l.contactName}</div>
          <div className="text-xs text-ink-400">{l.designation}</div>
        </div>
      ),
    },
    { key: "industry", header: "Industry", hideOnMobile: true },
    {
      key: "phone",
      header: "Phone",
      hideOnMobile: true,
      render: (l) => <span className="tabular-nums text-ink-600">{l.phone}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (l) => <StatusBadge kind="lead" value={l.status} size="sm" />,
    },
    {
      key: "interest",
      header: "Interest",
      render: (l) => (
        <StatusBadge kind="interest" value={l.interest} size="sm" dot={false} />
      ),
    },
    { key: "assignedTo", header: "Assigned To", hideOnMobile: true },
    {
      key: "lastContact",
      header: "Last Contact",
      hideOnMobile: true,
      render: (l) => (
        <span className="text-ink-600">{formatDate(l.lastContact)}</span>
      ),
    },
    {
      key: "nextFollowUp",
      header: "Next Follow-up",
      hideOnMobile: true,
      render: (l) =>
        l.nextFollowUp ? (
          <span className="text-ink-600">{formatDate(l.nextFollowUp)}</span>
        ) : (
          <span className="text-ink-300">—</span>
        ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (l) => (
        <RowActions
          actions={[
            {
              label: "View",
              icon: Eye,
              onClick: () => router.push(`/leads/${l.id}`),
            },
            {
              label: "Edit",
              icon: Pencil,
              onClick: () => router.push(`/leads/${l.id}?edit=1`),
            },
            { label: "Call", icon: Phone, onClick: () => setCallLead(l) },
            {
              label: "Add Follow-up",
              icon: CalendarPlus,
              onClick: () => setFollowUpLead(l),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Every business lead aggregated across industries."
        actions={
          <>
            <Button
              variant="outline"
              icon={Upload}
              onClick={() => setImportOpen(true)}
            >
              Import Leads
            </Button>
            <Button variant="outline" icon={Download} onClick={exportLeads}>
              Export
            </Button>
            <Button href="/leads/new" icon={Plus}>
              Add Lead
            </Button>
          </>
        }
      />

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar
            value={query}
            onChange={(v) => {
              setQuery(v);
              setPage(1);
            }}
            placeholder="Search company, contact, phone, lead ID…"
            className="sm:max-w-md"
          />
        </div>

        <FilterPanel
          filters={filterConfig}
          values={filters}
          onChange={(v) => {
            setFilters(v);
            setPage(1);
          }}
          resultLabel={`${filtered.length} lead${filtered.length === 1 ? "" : "s"} found`}
        />

        <Card className="overflow-hidden">
          <DataTable
            columns={columns}
            rows={pageRows}
            onRowClick={(l) => router.push(`/leads/${l.id}`)}
            mobileTitle={(l) => l.companyName}
            mobileSubtitle={(l) => `${l.contactName}`}
            emptyTitle="No leads match your filters"
            emptyDescription="Clear a filter or adjust your search to see more results."
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

      <CallResultModal
        open={callLead !== null}
        onClose={() => setCallLead(null)}
        companyName={callLead?.companyName}
        contactName={callLead?.contactName}
      />
      <AddFollowUpModal
        open={followUpLead !== null}
        onClose={() => setFollowUpLead(null)}
        leadId={followUpLead?.id}
        companyName={followUpLead?.companyName}
        contactName={followUpLead?.contactName}
        employees={employees}
        onSaved={() => router.refresh()}
      />
      <ImportLeadsModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
      />
    </div>
  );
}
