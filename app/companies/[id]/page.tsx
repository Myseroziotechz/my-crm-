"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Globe,
  Phone,
  Mail,
  MapPin,
  Building2,
  Pencil,
  Plus,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs } from "@/components/ui/Tabs";
import { DataTable } from "@/components/ui/DataTable";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { formatDate, formatDateTime, formatDuration } from "@/lib/utils";
import {
  companies,
  contacts,
  leads,
  calls,
  activityForLead,
} from "@/mock";
import type { Column, Contact, Lead, Call } from "@/lib/types";

export default function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const company = companies.find((c) => c.id === id);
  const [tab, setTab] = useState("overview");

  if (!company) notFound();

  const companyContacts = contacts.filter((c) => c.companyId === company.id);
  const companyLeads = leads.filter((l) => l.companyId === company.id);
  const companyCalls = calls.filter((c) => c.companyId === company.id);
  const activities = companyLeads.flatMap((l) => activityForLead(l.id)).slice(0, 20);

  const contactCols: Column<Contact>[] = [
    { key: "name", header: "Name", render: (c) => <span className="font-medium text-ink-900">{c.name}</span> },
    { key: "designation", header: "Designation" },
    { key: "phone", header: "Phone", hideOnMobile: true },
    { key: "email", header: "Email", hideOnMobile: true },
    {
      key: "leadStatus",
      header: "Lead Status",
      render: (c) => <StatusBadge kind="lead" value={c.leadStatus} size="sm" />,
    },
  ];

  const leadCols: Column<Lead>[] = [
    { key: "id", header: "Lead ID", render: (l) => <span className="font-mono text-xs text-ink-500">{l.id}</span> },
    { key: "contactName", header: "Contact" },
    { key: "status", header: "Status", render: (l) => <StatusBadge kind="lead" value={l.status} size="sm" /> },
    { key: "interest", header: "Interest", render: (l) => <StatusBadge kind="interest" value={l.interest} size="sm" dot={false} /> },
    { key: "assignedTo", header: "Assigned", hideOnMobile: true },
    { key: "nextFollowUp", header: "Next Follow-up", hideOnMobile: true, render: (l) => formatDate(l.nextFollowUp) },
  ];

  const callCols: Column<Call>[] = [
    { key: "date", header: "Date", render: (c) => formatDateTime(c.date) },
    { key: "contactName", header: "Contact", hideOnMobile: true },
    { key: "employeeName", header: "Employee", hideOnMobile: true },
    { key: "status", header: "Status", render: (c) => <StatusBadge kind="call" value={c.status} size="sm" /> },
    { key: "duration", header: "Duration", render: (c) => formatDuration(c.duration) },
  ];

  return (
    <div>
      <PageHeader
        title={company.name}
        breadcrumbs={[
          { label: "Companies", href: "/companies" },
          { label: company.name },
        ]}
        description={
          <span className="flex items-center gap-2">
            {company.industry}
            <StatusBadge kind="company" value={company.status} size="sm" />
          </span>
        }
        actions={
          <>
            <Button variant="outline" icon={Pencil}>
              Edit
            </Button>
            <Button href="/leads/new" icon={Plus}>
              Add Lead
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="Company Details" />
          <CardBody className="space-y-3">
            {[
              [Building2, "Industry", company.industry],
              [Globe, "Website", company.website],
              [Phone, "Phone", company.phone],
              [Mail, "Email", company.email],
              [MapPin, "Address", `${company.address}, ${company.city}, ${company.state}`],
            ].map(([Icon, label, value], i) => {
              const I = Icon as typeof Building2;
              return (
                <div key={i} className="flex items-start gap-3">
                  <I className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
                  <div className="min-w-0">
                    <p className="text-xs text-ink-400">{label as string}</p>
                    <p className="text-sm text-ink-800">{value as string}</p>
                  </div>
                </div>
              );
            })}
            <div className="grid grid-cols-2 gap-3 border-t border-ink-100 pt-3">
              <div>
                <p className="text-lg font-semibold text-ink-900">
                  {companyContacts.length}
                </p>
                <p className="text-xs text-ink-400">Contacts</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-ink-900">
                  {companyLeads.length}
                </p>
                <p className="text-xs text-ink-400">Leads</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <div className="px-2 pt-1">
            <Tabs
              tabs={[
                { key: "overview", label: "Overview" },
                { key: "contacts", label: "Contacts", count: companyContacts.length },
                { key: "leads", label: "Leads", count: companyLeads.length },
                { key: "calls", label: "Calls", count: companyCalls.length },
                { key: "activities", label: "Activities" },
              ]}
              active={tab}
              onChange={setTab}
            />
          </div>

          <div className="p-4">
            {tab === "overview" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    ["Total Leads", companyLeads.length],
                    ["Won", companyLeads.filter((l) => l.status === "Won").length],
                    [
                      "Interested",
                      companyLeads.filter((l) => l.status === "Interested").length,
                    ],
                    ["Calls", companyCalls.length],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-lg border border-ink-100 bg-ink-50/50 p-3"
                    >
                      <p className="text-lg font-semibold text-ink-900">
                        {value}
                      </p>
                      <p className="text-xs text-ink-400">{label}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-ink-800">
                    Primary contact
                  </h4>
                  {companyContacts.find((c) => c.isPrimary) ? (
                    <p className="text-sm text-ink-600">
                      {companyContacts.find((c) => c.isPrimary)!.name} ·{" "}
                      {companyContacts.find((c) => c.isPrimary)!.designation}
                    </p>
                  ) : (
                    <p className="text-sm text-ink-400">Not set</p>
                  )}
                </div>
              </div>
            )}
            {tab === "contacts" && (
              <DataTable columns={contactCols} rows={companyContacts} emptyTitle="No contacts" />
            )}
            {tab === "leads" && (
              <DataTable
                columns={leadCols}
                rows={companyLeads}
                emptyTitle="No leads"
                onRowClick={undefined}
                mobileTitle={(l) => l.contactName}
              />
            )}
            {tab === "calls" && (
              <DataTable columns={callCols} rows={companyCalls} emptyTitle="No calls logged" />
            )}
            {tab === "activities" && (
              <ActivityTimeline events={activities} />
            )}
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <Card>
          <CardBody className="flex items-center justify-between text-sm">
            <span className="text-ink-500">Jump to leads for this company</span>
            <Link
              href={`/leads?company=${encodeURIComponent(company.name)}`}
              className="font-medium text-brand-600 hover:text-brand-700"
            >
              Open in Leads →
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
