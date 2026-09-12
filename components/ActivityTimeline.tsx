import {
  Plus,
  UserPlus,
  Phone,
  Flag,
  CalendarClock,
  StickyNote,
  Mail,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { ActivityEvent } from "@/mock";

const ICONS = {
  lead: Plus,
  assign: UserPlus,
  call: Phone,
  status: Flag,
  followup: CalendarClock,
  note: StickyNote,
  email: Mail,
};

export function ActivityTimeline({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0)
    return <p className="text-sm text-ink-400">No activity yet.</p>;

  return (
    <ol className="relative space-y-5 pl-6">
      <span className="absolute left-2 top-1 bottom-1 w-px bg-ink-200" />
      {events.map((e) => {
        const Icon = ICONS[e.type] ?? Flag;
        return (
          <li key={e.id} className="relative">
            <span className="absolute -left-6 flex h-4 w-4 items-center justify-center rounded-full bg-brand-100 ring-4 ring-white">
              <Icon className="h-2.5 w-2.5 text-brand-700" />
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-ink-400">{formatDate(e.date)}</span>
              <span className="text-sm font-medium text-ink-800">
                {e.title}
              </span>
              {e.description && (
                <span className="text-xs text-ink-500">{e.description}</span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
