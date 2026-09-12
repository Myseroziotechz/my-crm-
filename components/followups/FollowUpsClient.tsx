"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CalendarClock, Eye, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RowActions } from "@/components/ui/RowActions";
import { AddFollowUpModal } from "@/components/followups/AddFollowUpModal";
import { completeFollowUp } from "@/app/followups/actions";
import { formatDate, formatTime } from "@/lib/utils";
import type { Column, FollowUp } from "@/lib/types";
import type { EmployeeOption, LeadOption } from "@/lib/supabase/queries";

type TabKey = "today" | "upcoming" | "completed" | "missed";

interface Props {
  followUps: FollowUp[];
  employees: EmployeeOption[];
  leadOptions: LeadOption[];
}

export function FollowUpsClient({ followUps, employees, leadOptions }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("today");
  const [addOpen, setAddOpen] = useState(false);
  const [targetLeadId, setTargetLeadId] = useState<string | undefined>(undefined);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const buckets = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      today: followUps.filter(
        (f) => f.date === today && f.status === "Pending",
      ),
      upcoming: followUps.filter(
        (f) => f.date > today && f.status === "Pending",
      ),
      completed: followUps.filter((f) => f.status === "Completed"),
      missed: followUps.filter(
        (f) =>
          f.status === "Missed" ||
          (f.status === "Pending" && f.date < today),
      ),
    };
  }, [followUps]);

  const rows = buckets[tab];

  const complete = async (f: FollowUp) => {
    setCompletingId(f.id);
    await completeFollowUp(f.id, f.leadId);
    setCompletingId(null);
    router.refresh();
  };

  const openScheduleFor = (leadId?: string) => {
    setTargetLeadId(leadId);
    setAddOpen(true);
  };

  const columns: Column<FollowUp>[] = [
    {
      key: "companyName",
      header: "Company",
      render: (f) => (
        <span className="font-medium text-ink-900">{f.companyName}</span>
      ),
    },
    { key: "contactName", header: "Contact", hideOnMobile: true },
    { key: "employeeName", header: "Employee", hideOnMobile: true },
    {
      key: "date",
      header: "Follow-up Date",
      render: (f) => <span className="text-ink-600">{formatDate(f.date)}</span>,
    },
    {
      key: "time",
      header: "Time",
      render: (f) => <span className="tabular-nums text-ink-600">{formatTime(f.time)}</span>,
    },
    { key: "reason", header: "Reason", hideOnMobile: true },
    {
      key: "status",
      header: "Status",
      render: (f) => <StatusBadge kind="followup" value={f.status} size="sm" />,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (f) => (
        <div className="flex items-center justify-end gap-1">
          {(f.status === "Pending" || f.status === "Missed") && (
            <>
              <Button
                size="sm"
                variant="outline"
                icon={CheckCircle2}
                disabled={completingId === f.id}
                onClick={() => complete(f)}
              >
                {completingId === f.id ? "…" : "Complete"}
              </Button>
              <RowActions
                actions={[
                  {
                    label: "Reschedule",
                    icon: CalendarClock,
                    onClick: () => openScheduleFor(f.leadId),
                  },
                  {
                    label: "View Lead",
                    icon: Eye,
                    onClick: () => router.push(`/leads/${f.leadId}`),
                  },
                ]}
              />
            </>
          )}
          {(f.status === "Completed" || f.status === "Cancelled") && (
            <RowActions
              actions={[
                {
                  label: "View Lead",
                  icon: Eye,
                  onClick: () => router.push(`/leads/${f.leadId}`),
                },
              ]}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Follow-ups"
        description="Track scheduled touchpoints and keep deals moving."
        actions={
          <Button icon={Plus} onClick={() => openScheduleFor(undefined)}>
            Schedule Follow-up
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            ["Today", buckets.today.length, "text-brand-700"],
            ["Upcoming", buckets.upcoming.length, "text-ink-900"],
            ["Completed", buckets.completed.length, "text-emerald-700"],
            ["Missed", buckets.missed.length, "text-rose-700"],
          ] as const
        ).map(([label, count, color]) => (
          <Card key={label} className="p-3.5">
            <p className={`text-2xl font-semibold ${color}`}>{count}</p>
            <p className="text-xs text-ink-400">{label}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="px-2 pt-1">
          <Tabs
            tabs={[
              { key: "today", label: "Today", count: buckets.today.length },
              {
                key: "upcoming",
                label: "Upcoming",
                count: buckets.upcoming.length,
              },
              {
                key: "completed",
                label: "Completed",
                count: buckets.completed.length,
              },
              { key: "missed", label: "Missed", count: buckets.missed.length },
            ]}
            active={tab}
            onChange={(k) => setTab(k as TabKey)}
          />
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          mobileTitle={(f) => f.companyName}
          mobileSubtitle={(f) => `${formatDate(f.date)} · ${formatTime(f.time)}`}
          emptyTitle={`No ${tab} follow-ups`}
          emptyDescription="Nothing to show in this view right now."
        />
      </Card>

      <AddFollowUpModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        leadId={targetLeadId}
        leadOptions={leadOptions}
        employees={employees}
        onSaved={() => router.refresh()}
      />
    </div>
  );
}
