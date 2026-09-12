"use client";

import { useState } from "react";
import { Plus, Mail, Phone } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Avatar } from "@/components/ui/Avatar";
import { RowActions } from "@/components/ui/RowActions";
import { cn } from "@/lib/utils";
import { employees } from "@/mock";
import type { Column, Employee } from "@/lib/types";

function PerformanceBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-ink-100">
        <div
          className={cn(
            "h-full rounded-full",
            value >= 70
              ? "bg-emerald-500"
              : value >= 40
                ? "bg-amber-500"
                : "bg-rose-500",
          )}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-ink-500">{value}</span>
    </div>
  );
}

export default function TeamPage() {
  const [rows] = useState(employees);

  const columns: Column<Employee>[] = [
    {
      key: "name",
      header: "Employee",
      render: (e) => (
        <div className="flex items-center gap-3">
          <Avatar name={e.name} color={e.avatarColor} size="sm" />
          <div>
            <div className="font-medium text-ink-900">{e.name}</div>
            <div className="text-xs text-ink-400">{e.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (e) => <StatusBadge kind="role" value={e.role} size="sm" />,
    },
    {
      key: "leadsAssigned",
      header: "Leads",
      align: "center",
      render: (e) => (
        <span className="tabular-nums">{e.stats.leadsAssigned}</span>
      ),
    },
    {
      key: "calls",
      header: "Calls",
      align: "center",
      render: (e) => <span className="tabular-nums">{e.stats.calls}</span>,
    },
    {
      key: "interested",
      header: "Interested",
      align: "center",
      hideOnMobile: true,
      render: (e) => <span className="tabular-nums">{e.stats.interested}</span>,
    },
    {
      key: "qualified",
      header: "Qualified",
      align: "center",
      hideOnMobile: true,
      render: (e) => <span className="tabular-nums">{e.stats.qualified}</span>,
    },
    {
      key: "won",
      header: "Won",
      align: "center",
      render: (e) => (
        <span className="tabular-nums font-medium text-emerald-700">
          {e.stats.won}
        </span>
      ),
    },
    {
      key: "performance",
      header: "Performance",
      render: (e) => <PerformanceBar value={e.stats.performance} />,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (e) => (
        <RowActions
          actions={[
            { label: "Email", icon: Mail, href: `mailto:${e.email}` },
            { label: "Call", icon: Phone, href: `tel:${e.phone}` },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Team"
        description="Sales and marketing employees with their lead performance."
        actions={
          <Button icon={Plus}>Add Employee</Button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Team members", employees.length],
          ["Active", employees.filter((e) => e.active).length],
          [
            "Total leads owned",
            employees.reduce((s, e) => s + e.stats.leadsAssigned, 0),
          ],
          ["Total wins", employees.reduce((s, e) => s + e.stats.won, 0)],
        ].map(([label, value]) => (
          <Card key={label} className="p-3.5">
            <p className="text-2xl font-semibold text-ink-900">{value}</p>
            <p className="text-xs text-ink-400">{label}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <DataTable
          columns={columns}
          rows={rows}
          mobileTitle={(e) => e.name}
          mobileSubtitle={(e) => e.role}
        />
      </Card>
    </div>
  );
}
