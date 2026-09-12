import { cn } from "@/lib/utils";
import {
  CALL_STATUS_TONE,
  COMPANY_STATUS_TONE,
  FOLLOWUP_TONE,
  INTEREST_TONE,
  LEAD_STATUS_TONE,
  PRIORITY_TONE,
  ROLE_TONE,
} from "@/lib/constants";
import type {
  CallStatus,
  CompanyStatus,
  FollowUpStatus,
  InterestLevel,
  LeadStatus,
  Priority,
  UserRole,
} from "@/lib/types";

type Tone = { bg: string; text: string; dot: string; ring: string };

const MAP = {
  lead: LEAD_STATUS_TONE as Record<string, Tone>,
  interest: INTEREST_TONE as Record<string, Tone>,
  call: CALL_STATUS_TONE as Record<string, Tone>,
  followup: FOLLOWUP_TONE as Record<string, Tone>,
  company: COMPANY_STATUS_TONE as Record<string, Tone>,
  priority: PRIORITY_TONE as Record<string, Tone>,
  role: ROLE_TONE as Record<string, Tone>,
};

interface Props {
  kind: keyof typeof MAP;
  value:
    | LeadStatus
    | InterestLevel
    | CallStatus
    | FollowUpStatus
    | CompanyStatus
    | Priority
    | UserRole;
  dot?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({
  kind,
  value,
  dot = true,
  size = "md",
  className,
}: Props) {
  const tone = MAP[kind][value] ?? {
    bg: "bg-ink-100",
    text: "text-ink-600",
    dot: "bg-ink-400",
    ring: "ring-ink-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium ring-1 ring-inset",
        tone.bg,
        tone.text,
        tone.ring,
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        className,
      )}
    >
      {dot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} aria-hidden />
      )}
      {value}
    </span>
  );
}
