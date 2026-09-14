"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, Pencil } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { SearchBar } from "@/components/ui/SearchBar";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RowActions } from "@/components/ui/RowActions";
import { Modal } from "@/components/ui/Modal";
import { FilterPanel, type FilterValues } from "@/components/ui/FilterPanel";
import { CompanyForm } from "@/components/companies/CompanyForm";
import {
  INDUSTRIES,
  CITIES,
  STATES,
  COMPANY_STATUSES,
  toOptions,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Column, Company } from "@/lib/types";

export function CompaniesClient({ companies }: { companies: Company[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FilterValues>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [addOpen, setAddOpen] = useState(false);

  const filterConfig = useMemo(
    () => [
      { key: "industry", label: "Industry", options: toOptions(INDUSTRIES) },
      { key: "city", label: "City", options: toOptions(CITIES) },
      { key: "state", label: "State", options: toOptions(STATES) },
      { key: "status", label: "Status", options: toOptions(COMPANY_STATUSES) },
    ],
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return companies.filter((c) => {
      if (q && !`${c.name} ${c.city} ${c.email}`.toLowerCase().includes(q))
        return false;
      if (filters.industry && c.industry !== filters.industry) return false;
      if (filters.city && c.city !== filters.city) return false;
      if (filters.state && c.state !== filters.state) return false;
      if (filters.status && c.status !== filters.status) return false;
      return true;
    });
  }, [companies, query, filters]);

  const pageCount = Math.ceil(filtered.length / pageSize);
  const safePage = Math.min(page, Math.max(1, pageCount));
  const rows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const columns: Column<Company>[] = [
    {
      key: "name",
      header: "Company Name",
      render: (c) => (
        <span className="font-medium text-ink-900">{c.name}</span>
      ),
    },
    { key: "industry", header: "Industry" },
    {
      key: "contactCount",
      header: "Contacts",
      align: "center",
      render: (c) => <span className="tabular-nums">{c.contactCount}</span>,
    },
    {
      key: "leadCount",
      header: "Leads",
      align: "center",
      render: (c) => <span className="tabular-nums">{c.leadCount}</span>,
    },
    { key: "city", header: "City", hideOnMobile: true },
    {
      key: "status",
      header: "Status",
      render: (c) => <StatusBadge kind="company" value={c.status} size="sm" />,
    },
    {
      key: "lastContact",
      header: "Last Contact",
      hideOnMobile: true,
      render: (c) => (
        <span className="text-ink-600">{formatDate(c.lastContact)}</span>
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
              label: "View",
              icon: Eye,
              onClick: () => router.push(`/companies/${c.id}`),
            },
            {
              label: "Edit",
              icon: Pencil,
              onClick: () => router.push(`/companies/${c.id}`),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Companies"
        description="Organisations that leads and contacts belong to."
        actions={
          <Button icon={Plus} onClick={() => setAddOpen(true)}>
            Add Company
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
          placeholder="Search companies…"
          className="sm:max-w-md"
        />

        <FilterPanel
          filters={filterConfig}
          values={filters}
          onChange={(v) => {
            setFilters(v);
            setPage(1);
          }}
          resultLabel={`${filtered.length} compan${filtered.length === 1 ? "y" : "ies"}`}
        />

        <Card className="overflow-hidden">
          <DataTable
            columns={columns}
            rows={rows}
            onRowClick={(c) => router.push(`/companies/${c.id}`)}
            mobileTitle={(c) => c.name}
            mobileSubtitle={(c) => `${c.industry} · ${c.city}`}
            emptyTitle="No companies found"
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

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Company"
        description="Create a new company record."
        size="lg"
      >
        <CompanyForm
          onDone={() => setAddOpen(false)}
          onSaved={() => router.refresh()}
        />
      </Modal>
    </div>
  );
}
