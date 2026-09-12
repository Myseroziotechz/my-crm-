/**
 * Centralised enums, option lists and presentation metadata.
 * Never hard-code these values in components - import from here.
 */

import type {
  CallStatus,
  CompanyStatus,
  FollowUpStatus,
  Industry,
  InterestLevel,
  LeadSource,
  LeadStatus,
  Priority,
  SelectOption,
  UserRole,
} from "./types";

export const APP_NAME = "MyTechz CRM";

/* ------------------------------------------------------------------ */
/* Industries                                                          */
/* ------------------------------------------------------------------ */

export const INDUSTRIES: Industry[] = [
  "Real Estate",
  "Healthcare",
  "Education",
  "IT / Software",
  "Hospitality",
  "Manufacturing",
  "Retail",
  "Finance",
  "Automotive",
  "Other",
];

/* ------------------------------------------------------------------ */
/* Lead status                                                         */
/* ------------------------------------------------------------------ */

export const LEAD_STATUSES: LeadStatus[] = [
  "New",
  "Contacted",
  "Interested",
  "Follow-up",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
  "Not Interested",
];

/** Ordered columns used by the Kanban pipeline board. */
export const PIPELINE_STAGES: LeadStatus[] = [
  "New",
  "Contacted",
  "Interested",
  "Follow-up",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
];

type BadgeTone = {
  bg: string;
  text: string;
  dot: string;
  ring: string;
};

export const LEAD_STATUS_TONE: Record<LeadStatus, BadgeTone> = {
  New: {
    bg: "bg-ink-100",
    text: "text-ink-700",
    dot: "bg-ink-400",
    ring: "ring-ink-200",
  },
  Contacted: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    dot: "bg-sky-500",
    ring: "ring-sky-200",
  },
  Interested: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    ring: "ring-emerald-200",
  },
  "Follow-up": {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    ring: "ring-amber-200",
  },
  Qualified: {
    bg: "bg-brand-50",
    text: "text-brand-700",
    dot: "bg-brand-600",
    ring: "ring-brand-200",
  },
  Proposal: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    dot: "bg-violet-500",
    ring: "ring-violet-200",
  },
  Negotiation: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    dot: "bg-indigo-500",
    ring: "ring-indigo-200",
  },
  Won: {
    bg: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-600",
    ring: "ring-green-200",
  },
  Lost: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
    ring: "ring-rose-200",
  },
  "Not Interested": {
    bg: "bg-ink-100",
    text: "text-ink-600",
    dot: "bg-ink-400",
    ring: "ring-ink-200",
  },
};

/* ------------------------------------------------------------------ */
/* Interest level                                                      */
/* ------------------------------------------------------------------ */

export const INTEREST_LEVELS: InterestLevel[] = [
  "High",
  "Medium",
  "Low",
  "Not Interested",
];

export const INTEREST_TONE: Record<InterestLevel, BadgeTone> = {
  High: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    ring: "ring-emerald-200",
  },
  Medium: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    ring: "ring-amber-200",
  },
  Low: {
    bg: "bg-ink-100",
    text: "text-ink-600",
    dot: "bg-ink-400",
    ring: "ring-ink-200",
  },
  "Not Interested": {
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
    ring: "ring-rose-200",
  },
};

/* ------------------------------------------------------------------ */
/* Call status                                                         */
/* ------------------------------------------------------------------ */

export const CALL_STATUSES: CallStatus[] = [
  "Answered",
  "No Answer",
  "Busy",
  "Call Back",
  "Wrong Number",
];

export const CALL_STATUS_TONE: Record<CallStatus, BadgeTone> = {
  Answered: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    ring: "ring-emerald-200",
  },
  "No Answer": {
    bg: "bg-ink-100",
    text: "text-ink-600",
    dot: "bg-ink-400",
    ring: "ring-ink-200",
  },
  Busy: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    ring: "ring-amber-200",
  },
  "Call Back": {
    bg: "bg-sky-50",
    text: "text-sky-700",
    dot: "bg-sky-500",
    ring: "ring-sky-200",
  },
  "Wrong Number": {
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
    ring: "ring-rose-200",
  },
};

/* ------------------------------------------------------------------ */
/* Follow-up status                                                    */
/* ------------------------------------------------------------------ */

export const FOLLOWUP_STATUSES: FollowUpStatus[] = [
  "Pending",
  "Completed",
  "Missed",
  "Cancelled",
];

export const FOLLOWUP_TONE: Record<FollowUpStatus, BadgeTone> = {
  Pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    ring: "ring-amber-200",
  },
  Completed: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    ring: "ring-emerald-200",
  },
  Missed: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
    ring: "ring-rose-200",
  },
  Cancelled: {
    bg: "bg-ink-100",
    text: "text-ink-600",
    dot: "bg-ink-400",
    ring: "ring-ink-200",
  },
};

/* ------------------------------------------------------------------ */
/* Company status                                                      */
/* ------------------------------------------------------------------ */

export const COMPANY_STATUSES: CompanyStatus[] = [
  "Active",
  "Inactive",
  "Prospect",
];

export const COMPANY_STATUS_TONE: Record<CompanyStatus, BadgeTone> = {
  Active: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    ring: "ring-emerald-200",
  },
  Inactive: {
    bg: "bg-ink-100",
    text: "text-ink-600",
    dot: "bg-ink-400",
    ring: "ring-ink-200",
  },
  Prospect: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    dot: "bg-sky-500",
    ring: "ring-sky-200",
  },
};

/* ------------------------------------------------------------------ */
/* Priority                                                            */
/* ------------------------------------------------------------------ */

export const PRIORITIES: Priority[] = ["Low", "Medium", "High"];

export const PRIORITY_TONE: Record<Priority, BadgeTone> = {
  Low: {
    bg: "bg-ink-100",
    text: "text-ink-600",
    dot: "bg-ink-400",
    ring: "ring-ink-200",
  },
  Medium: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    dot: "bg-sky-500",
    ring: "ring-sky-200",
  },
  High: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
    ring: "ring-rose-200",
  },
};

/* ------------------------------------------------------------------ */
/* Lead source & roles                                                 */
/* ------------------------------------------------------------------ */

export const LEAD_SOURCES: LeadSource[] = [
  "Website",
  "Referral",
  "Cold Call",
  "Email Campaign",
  "Trade Show",
  "Social Media",
  "Partner",
  "Advertisement",
];

export const USER_ROLES: UserRole[] = [
  "Admin",
  "Manager",
  "Sales",
  "Marketing",
  "Viewer",
];

export const ROLE_TONE: Record<UserRole, BadgeTone> = {
  Admin: {
    bg: "bg-brand-50",
    text: "text-brand-700",
    dot: "bg-brand-600",
    ring: "ring-brand-200",
  },
  Manager: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    dot: "bg-violet-500",
    ring: "ring-violet-200",
  },
  Sales: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    ring: "ring-emerald-200",
  },
  Marketing: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    ring: "ring-amber-200",
  },
  Viewer: {
    bg: "bg-ink-100",
    text: "text-ink-600",
    dot: "bg-ink-400",
    ring: "ring-ink-200",
  },
};

/* ------------------------------------------------------------------ */
/* Cities / states (mock geography - Indian metros)                    */
/* ------------------------------------------------------------------ */

export const CITIES: string[] = [
  "Bengaluru",
  "Mumbai",
  "Delhi",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Kochi",
];

export const STATES: string[] = [
  "Karnataka",
  "Maharashtra",
  "Delhi",
  "Telangana",
  "Tamil Nadu",
  "West Bengal",
  "Gujarat",
  "Rajasthan",
  "Kerala",
];

/* ------------------------------------------------------------------ */
/* Chart palette (validated categorical palette - dataviz skill)       */
/* ------------------------------------------------------------------ */

export const CHART_COLORS = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#e87ba4", // magenta
  "#008300", // green
  "#4a3aa7", // violet
  "#e34948", // red
];

/* Helpers to build <select> option lists from the arrays above. */
export function toOptions<T extends string>(values: T[]): SelectOption<T>[] {
  return values.map((v) => ({ label: v, value: v }));
}

export const REPORT_DATE_RANGES: SelectOption[] = [
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "This Month", value: "month" },
  { label: "Custom Range", value: "custom" },
];
