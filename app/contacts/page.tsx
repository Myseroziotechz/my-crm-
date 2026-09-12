"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Phone, Mail, Building2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { SearchBar } from "@/components/ui/SearchBar";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RowActions } from "@/components/ui/RowActions";
import { FilterPanel, type FilterValues } from "@/components/ui/FilterPanel";
import { INDUSTRIES, toOptions } from "@/lib/constants";
import { contacts, companies } from "@/mock";
import type { Column, Contact } from "@/lib/types";

const DESIGNATIONS = Array.from(
  new Set(contacts.map((c) => c.designation)),
).sort();

function ContactsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FilterValues>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
  }, [searchParams]);

  const filterConfig = useMemo(
    () => [
      { key: "industry", label: "Industry", options: toOptions(INDUSTRIES) },
      {
        key: "company",
        label: "Company",
        options: companies.map((c) => ({ label: c.name, value: c.name })),
      },
      {
        key: "designation",
        label: "Designation",
        options: DESIGNATIONS.map((d) => ({ label: d, value: d })),
      },
      {
        key: "city",
        label: "City",
        options: Array.from(new Set(contacts.map((c) => c.city))).map((c) => ({
          label: c,
          value: c,
        })),
      },
    ],
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts.filter((c) => {
      if (
        q &&
        !`${c.name} ${c.companyName} ${c.email} ${c.phone}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      if (filters.industry && c.industry !== filters.industry) return false;
      if (filters.company && c.companyName !== filters.company) return false;
      if (filters.designation && c.designation !== filters.designation)
        return false;
      if (filters.city && c.city !== filters.city) return false;
      return true;
    });
  }, [query, filters]);

  const pageCount = Math.ceil(filtered.length / pageSize);
  const safePage = Math.min(page, Math.max(1, pageCount));
  const rows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const columns: Column<Contact>[] = [
    {
      key: "name",
      header: "Contact Name",
      render: (c) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-ink-900">{c.name}</span>
          {c.isPrimary && (
            <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-700">
              Primary
            </span>
          )}
        </div>
      ),
    },
    { key: "companyName", header: "Company" },
    { key: "designation", header: "Designation", hideOnMobile: true },
    {
      key: "phone",
      header: "Phone",
      hideOnMobile: true,
      render: (c) => <span className="tabular-nums text-ink-600">{c.phone}</span>,
    },
    { key: "email", header: "Email", hideOnMobile: true },
    { key: "industry", header: "Industry", hideOnMobile: true },
    {
      key: "leadStatus",
      header: "Lead Status",
      render: (c) => <StatusBadge kind="lead" value={c.leadStatus} size="sm" />,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (c) => (
        <RowActions
          actions={[
            { label: "Call", icon: Phone, href: `tel:${c.phone}` },
            { label: "Email", icon: Mail, href: `mailto:${c.email}` },
            {
              label: "View Company",
              icon: Building2,
              onClick: () => router.push(`/companies/${c.companyId}`),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Contacts"
        description="People associated with companies in the CRM."
        actions={
          <Button href="/leads/new" icon={Plus}>
            Add Contact
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
          placeholder="Search name, company, email, phone…"
          className="sm:max-w-md"
        />

        <FilterPanel
          filters={filterConfig}
          values={filters}
          onChange={(v) => {
            setFilters(v);
            setPage(1);
          }}
          resultLabel={`${filtered.length} contact${filtered.length === 1 ? "" : "s"}`}
        />

        <Card className="overflow-hidden">
          <DataTable
            columns={columns}
            rows={rows}
            onRowClick={(c) => router.push(`/companies/${c.companyId}`)}
            mobileTitle={(c) => c.name}
            mobileSubtitle={(c) => `${c.designation} · ${c.companyName}`}
            emptyTitle="No contacts found"
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
    </div>
  );
}

export default function ContactsPage() {
  return (
    <Suspense fallback={null}>
      <ContactsInner />
    </Suspense>
  );
}
