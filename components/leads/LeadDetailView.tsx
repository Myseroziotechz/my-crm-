"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Phone,
  MessageCircle,
  Mail,
  Pencil,
  CalendarPlus,
  Globe,
  MapPin,
  Building2,
  BadgeInfo,
  User,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { CallResultModal } from "@/components/calls/CallResultModal";
import { AddFollowUpModal } from "@/components/followups/AddFollowUpModal";
import { formatDate, formatCompactCurrency, formatTime } from "@/lib/utils";
import type { Call, FollowUp, Lead } from "@/lib/types";
import type { ActivityEvent } from "@/mock";
import type { EmployeeOption } from "@/lib/supabase/queries";

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Phone;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
      <div className="min-w-0">
        <dt className="text-xs text-ink-400">{label}</dt>
        <dd className="truncate text-sm text-ink-800">{value}</dd>
      </div>
    </div>
  );
}

interface Props {
  lead: Lead;
  events: ActivityEvent[];
  calls: Call[];
  followUps: FollowUp[];
  employees: EmployeeOption[];
}

export function LeadDetailView({ lead, events, calls, followUps, employees }: Props) {
  const router = useRouter();
  const [callOpen, setCallOpen] = useState(false);
  const [fuOpen, setFuOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title={lead.companyName}
        breadcrumbs={[
          { label: "Leads", href: "/leads" },
          { label: lead.id.slice(0, 8) },
        ]}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-ink-400">{lead.id.slice(0, 8)}</span>
            <StatusBadge kind="lead" value={lead.status} size="sm" />
            <StatusBadge kind="interest" value={lead.interest} size="sm" dot={false} />
            <StatusBadge kind="priority" value={lead.priority} size="sm" />
          </span>
        }
        actions={
          <>
            <Button variant="outline" icon={Phone} onClick={() => setCallOpen(true)}>
              Call
            </Button>
            <Button
              variant="outline"
              icon={MessageCircle}
              href={`https://wa.me/?text=Hi%20${encodeURIComponent(lead.contactName)}`}
            >
              WhatsApp
            </Button>
            <Button variant="outline" icon={Mail} href={`mailto:${lead.email}`}>
              Email
            </Button>
            <Button variant="outline" icon={Pencil}>
              Edit
            </Button>
            <Button icon={CalendarPlus} onClick={() => setFuOpen(true)}>
              Add Follow-up
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <Card>
            <CardHeader title="Contact Information" />
            <CardBody className="divide-y divide-ink-100 py-1">
              <InfoRow icon={User} label="Contact Name" value={lead.contactName} />
              <InfoRow
                icon={BadgeInfo}
                label="Designation"
                value={lead.designation}
              />
              <InfoRow icon={Phone} label="Phone" value={lead.phone} />
              <InfoRow icon={Mail} label="Email" value={lead.email} />
              <InfoRow
                icon={Globe}
                label="Website"
                value={
                  lead.website ? (
                    <a
                      href={`https://${lead.website}`}
                      className="text-brand-600 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {lead.website}
                    </a>
                  ) : (
                    "—"
                  )
                }
              />
              <InfoRow
                icon={MapPin}
                label="Location"
                value={`${lead.city}, ${lead.state}`}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Lead Information" />
            <CardBody className="divide-y divide-ink-100 py-1">
              <InfoRow icon={Building2} label="Industry" value={lead.industry} />
              <InfoRow icon={BadgeInfo} label="Lead Source" value={lead.source} />
              <InfoRow
                icon={User}
                label="Assigned Employee"
                value={lead.assignedTo}
              />
              <InfoRow
                icon={BadgeInfo}
                label="Created Date"
                value={formatDate(lead.createdDate)}
              />
              <InfoRow
                icon={BadgeInfo}
                label="Estimated Value"
                value={formatCompactCurrency(lead.value)}
              />
              <InfoRow
                icon={BadgeInfo}
                label="Priority"
                value={<StatusBadge kind="priority" value={lead.priority} size="sm" />}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Notes" />
            <CardBody>
              <p className="text-sm leading-relaxed text-ink-600">
                {lead.notes || "No notes yet."}
              </p>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader
              title="Activity Timeline"
              subtitle={`${events.length} events`}
            />
            <CardBody>
              <ActivityTimeline events={events} />
            </CardBody>
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader
                title="Calls"
                subtitle={`${calls.length} logged`}
              />
              <CardBody className="space-y-2">
                {calls.length === 0 && (
                  <p className="text-sm text-ink-400">No calls logged.</p>
                )}
                {calls.slice(0, 5).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2"
                  >
                    <div>
                      <StatusBadge kind="call" value={c.status} size="sm" />
                      <p className="mt-1 text-xs text-ink-500">
                        {formatDate(c.date)} · {c.employeeName}
                      </p>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Follow-ups"
                subtitle={`${followUps.length} scheduled`}
              />
              <CardBody className="space-y-2">
                {followUps.length === 0 && (
                  <p className="text-sm text-ink-400">No follow-ups.</p>
                )}
                {followUps.slice(0, 5).map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm text-ink-800">{f.reason}</p>
                      <p className="text-xs text-ink-500">
                        {formatDate(f.date)} · {formatTime(f.time)}
                      </p>
                    </div>
                    <StatusBadge kind="followup" value={f.status} size="sm" />
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardBody className="flex items-center justify-between">
              <p className="text-sm text-ink-500">
                Manage this company&apos;s full record
              </p>
              <Link
                href={`/companies/${lead.companyId}`}
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                View company →
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>

      <CallResultModal
        open={callOpen}
        onClose={() => setCallOpen(false)}
        companyName={lead.companyName}
        contactName={lead.contactName}
      />
      <AddFollowUpModal
        open={fuOpen}
        onClose={() => setFuOpen(false)}
        leadId={lead.id}
        companyName={lead.companyName}
        contactName={lead.contactName}
        employees={employees}
        onSaved={() => router.refresh()}
      />
    </div>
  );
}
