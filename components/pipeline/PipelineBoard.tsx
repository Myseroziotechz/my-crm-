"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GripVertical, CalendarClock } from "lucide-react";
import { cn, formatDate, formatCompactCurrency } from "@/lib/utils";
import { PIPELINE_STAGES, LEAD_STATUS_TONE } from "@/lib/constants";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Avatar } from "@/components/ui/Avatar";
import type { Lead, LeadStatus } from "@/lib/types";
import { employees } from "@/mock";

function empColor(name: string) {
  return employees.find((e) => e.name === name)?.avatarColor ?? "#475569";
}

export function PipelineBoard({ initialLeads }: { initialLeads: Lead[] }) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<LeadStatus | null>(null);

  const move = (id: string, status: LeadStatus) => {
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {PIPELINE_STAGES.map((stage) => {
        const items = leads.filter((l) => l.status === stage);
        const tone = LEAD_STATUS_TONE[stage];
        const value = items.reduce((s, l) => s + l.value, 0);
        return (
          <div
            key={stage}
            onDragOver={(e) => {
              e.preventDefault();
              setOverCol(stage);
            }}
            onDragLeave={() => setOverCol((c) => (c === stage ? null : c))}
            onDrop={() => {
              if (dragId) move(dragId, stage);
              setDragId(null);
              setOverCol(null);
            }}
            className={cn(
              "flex w-72 shrink-0 flex-col rounded-xl border bg-ink-50/60 transition-colors",
              overCol === stage
                ? "border-brand-400 bg-brand-50/50"
                : "border-ink-200",
            )}
          >
            <div className="flex items-center justify-between border-b border-ink-200 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", tone.dot)} />
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                  {stage}
                </span>
                <span className="rounded-full bg-white px-1.5 text-[11px] font-semibold text-ink-500 ring-1 ring-ink-200">
                  {items.length}
                </span>
              </div>
              <span className="text-[11px] text-ink-400">
                {formatCompactCurrency(value)}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
              {items.map((lead) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={() => setDragId(lead.id)}
                  onDragEnd={() => setDragId(null)}
                  onClick={() => router.push(`/leads/${lead.id}`)}
                  className={cn(
                    "group cursor-pointer rounded-lg border border-ink-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md",
                    dragId === lead.id && "opacity-40",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-ink-900">
                      {lead.companyName}
                    </p>
                    <GripVertical className="h-4 w-4 shrink-0 text-ink-300 group-hover:text-ink-400" />
                  </div>
                  <p className="mt-0.5 text-xs text-ink-500">
                    {lead.contactName} · {lead.designation}
                  </p>
                  <p className="mt-1 text-[11px] text-ink-400">
                    {lead.industry}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between">
                    <StatusBadge
                      kind="priority"
                      value={lead.priority}
                      size="sm"
                    />
                    <Avatar
                      name={lead.assignedTo}
                      color={empColor(lead.assignedTo)}
                      size="xs"
                    />
                  </div>

                  {lead.nextFollowUp && (
                    <div className="mt-2 flex items-center gap-1.5 border-t border-ink-100 pt-2 text-[11px] text-ink-500">
                      <CalendarClock className="h-3 w-3" />
                      Next: {formatDate(lead.nextFollowUp)}
                    </div>
                  )}
                </div>
              ))}
              {items.length === 0 && (
                <p className="px-2 py-6 text-center text-xs text-ink-400">
                  Drop leads here
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
