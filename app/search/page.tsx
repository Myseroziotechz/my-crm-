"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { Building2, Contact as ContactIcon, Users, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { SearchBar } from "@/components/ui/SearchBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { globalSearch } from "@/mock";

const ICONS = { Company: Building2, Contact: ContactIcon, Lead: Users };

function SearchInner() {
  const [query, setQuery] = useState("");
  const results = globalSearch(query);
  const grouped = results.reduce<Record<string, typeof results>>((acc, r) => {
    (acc[r.type] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Global Search"
        description="Search across companies, contacts and leads."
      />

      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Try “ABC”, a phone number, or a lead ID…"
      />

      <div className="mt-4 space-y-4">
        {!query && (
          <Card>
            <EmptyState
              icon={Search}
              title="Start typing to search"
              description="Results from companies, contacts and leads appear here."
            />
          </Card>
        )}
        {query && results.length === 0 && (
          <Card>
            <EmptyState title={`No results for “${query}”`} />
          </Card>
        )}
        {Object.entries(grouped).map(([type, items]) => {
          const Icon = ICONS[type as keyof typeof ICONS];
          return (
            <Card key={type} className="overflow-hidden">
              <div className="border-b border-ink-200 bg-ink-50/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                {type} · {items.length}
              </div>
              <div className="divide-y divide-ink-100">
                {items.map((r) => (
                  <Link
                    key={r.id}
                    href={r.href}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-ink-50"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 text-ink-500">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-ink-900">
                        {r.title}
                      </span>
                      <span className="block text-xs text-ink-500">
                        {r.subtitle}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchInner />
    </Suspense>
  );
}
