import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import type { FollowUp } from "@/lib/types";

export function TodaysFollowUps({ items }: { items: FollowUp[] }) {
  return (
    <Card>
      <CardHeader
        title="Today's Follow-ups"
        subtitle={`${items.length} scheduled for today`}
        action={
          <Link
            href="/followups"
            className="text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            View all
          </Link>
        }
      />
      {items.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No follow-ups today"
          description="You're all caught up. Check the upcoming tab for what's next."
        />
      ) : (
        <div className="divide-y divide-ink-100">
          {items.map((f) => (
            <div
              key={f.id}
              className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <span className="text-[10px] font-medium leading-none">
                    {f.time.split(" ")[1]}
                  </span>
                  <span className="text-xs font-semibold leading-tight">
                    {f.time.split(" ")[0]}
                  </span>
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-900">
                    {f.companyName}
                  </p>
                  <p className="truncate text-xs text-ink-500">
                    {f.contactName} · {f.reason}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 pl-17 sm:pl-0">
                <StatusBadge kind="followup" value={f.status} size="sm" />
                <Link
                  href={`/leads/${f.leadId}`}
                  className="inline-flex h-8 items-center rounded-lg border border-ink-300 bg-white px-3 text-xs font-medium text-ink-700 hover:bg-ink-50"
                >
                  View Lead
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
