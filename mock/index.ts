/**
 * Aggregation layer over the raw mock arrays.
 * Reconciles cross-entity counts and derives dashboard / report datasets.
 * Everything here is pure and computed once at module load.
 */

import type {
  Call,
  FollowUp,
  Lead,
  LeadStatus,
} from "@/lib/types";
import { INDUSTRIES, LEAD_STATUSES } from "@/lib/constants";
import { TODAY_ISO as TODAY } from "@/lib/utils";
import { companies } from "./companies";
import { contacts } from "./contacts";
import { leads } from "./leads";
import { calls } from "./calls";
import { followUps } from "./followups";
import { employees } from "./employees";
import { notifications, currentUser } from "./notifications";
import { industries } from "./industries";

/* ------------------------------------------------------------------ */
/* Reconcile per-company counts                                        */
/* ------------------------------------------------------------------ */

for (const company of companies) {
  company.contactCount = contacts.filter(
    (c) => c.companyId === company.id,
  ).length;
  company.leadCount = leads.filter((l) => l.companyId === company.id).length;
}

/* ------------------------------------------------------------------ */
/* Reconcile per-employee stats                                        */
/* ------------------------------------------------------------------ */

for (const emp of employees) {
  const own = leads.filter((l) => l.assignedToId === emp.id);
  const empCalls = calls.filter((c) => c.employeeId === emp.id);
  const interested = own.filter((l) =>
    ["Interested", "Qualified", "Proposal", "Negotiation", "Won"].includes(
      l.status,
    ),
  ).length;
  const qualified = own.filter((l) =>
    ["Qualified", "Proposal", "Negotiation", "Won"].includes(l.status),
  ).length;
  const won = own.filter((l) => l.status === "Won").length;

  emp.stats = {
    leadsAssigned: own.length,
    calls: empCalls.length,
    interested,
    qualified,
    won,
    performance: 0,
  };
}

// Performance score: weighted blend, normalised to 0 - 100 across the team.
const rawScores = employees.map(
  (e) =>
    e.stats.won * 5 +
    e.stats.qualified * 3 +
    e.stats.interested * 1.5 +
    e.stats.calls * 0.4,
);
const maxScore = Math.max(...rawScores, 1);
employees.forEach((e, i) => {
  e.stats.performance = Math.round((rawScores[i] / maxScore) * 100);
});

/* ------------------------------------------------------------------ */
/* Dashboard KPIs                                                      */
/* ------------------------------------------------------------------ */

const totalLeads = leads.length;
const newLeads = leads.filter((l) => l.status === "New").length;
const interestedLeads = leads.filter((l) => l.status === "Interested").length;
const qualifiedLeads = leads.filter((l) =>
  ["Qualified", "Proposal", "Negotiation"].includes(l.status),
).length;
const wonLeads = leads.filter((l) => l.status === "Won").length;
const notInterested = leads.filter(
  (l) => l.status === "Not Interested" || l.status === "Lost",
).length;
const followUpsToday = followUps.filter(
  (f) => f.date === TODAY && f.status === "Pending",
).length;
const conversionRate = totalLeads
  ? Math.round((wonLeads / totalLeads) * 1000) / 10
  : 0;

export interface DashboardKpi {
  key: string;
  label: string;
  value: string;
  delta: number;
  trend: "up" | "down" | "neutral";
}

export const dashboardKpis: DashboardKpi[] = [
  { key: "total", label: "Total Leads", value: String(totalLeads), delta: 12.4, trend: "up" },
  { key: "new", label: "New Leads", value: String(newLeads), delta: 4.1, trend: "up" },
  {
    key: "interested",
    label: "Interested Leads",
    value: String(interestedLeads),
    delta: 2.0,
    trend: "up",
  },
  {
    key: "followups",
    label: "Follow-ups Today",
    value: String(followUpsToday),
    delta: 0,
    trend: "neutral",
  },
  {
    key: "qualified",
    label: "Qualified Leads",
    value: String(qualifiedLeads),
    delta: 6.7,
    trend: "up",
  },
  { key: "won", label: "Won Leads", value: String(wonLeads), delta: 8.3, trend: "up" },
  {
    key: "notInterested",
    label: "Not Interested",
    value: String(notInterested),
    delta: 1.5,
    trend: "down",
  },
  {
    key: "conversion",
    label: "Conversion Rate",
    value: `${conversionRate}%`,
    delta: 1.2,
    trend: "up",
  },
];

/* ------------------------------------------------------------------ */
/* Chart datasets                                                      */
/* ------------------------------------------------------------------ */

export interface CategoryDatum {
  label: string;
  value: number;
}

export const leadsByIndustry: CategoryDatum[] = INDUSTRIES.map((ind) => ({
  label: ind,
  value: leads.filter((l) => l.industry === ind).length,
})).filter((d) => d.value > 0);

export const leadStatusDistribution: CategoryDatum[] = LEAD_STATUSES.map(
  (s) => ({
    label: s,
    value: leads.filter((l) => l.status === s).length,
  }),
).filter((d) => d.value > 0);

/** Calls grouped by day for the last 14 days. */
export const callsPerDay: CategoryDatum[] = (() => {
  const buckets: Record<string, number> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(`${TODAY}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - i);
    buckets[d.toISOString().slice(0, 10)] = 0;
  }
  for (const call of calls) {
    const day = call.date.slice(0, 10);
    if (day in buckets) buckets[day] += 1;
  }
  return Object.entries(buckets).map(([day, value]) => ({
    label: day.slice(5), // MM-DD
    value,
  }));
})();

export const interestedVsNot: CategoryDatum[] = [
  {
    label: "Interested",
    value: leads.filter((l) =>
      ["Interested", "Qualified", "Proposal", "Negotiation", "Won"].includes(
        l.status,
      ),
    ).length,
  },
  {
    label: "Not Interested",
    value: leads.filter(
      (l) => l.status === "Not Interested" || l.status === "Lost",
    ).length,
  },
  {
    label: "Undecided",
    value: leads.filter((l) =>
      ["New", "Contacted", "Follow-up"].includes(l.status),
    ).length,
  },
];

/** Conversion funnel - cumulative stages. */
export const conversionFunnel: CategoryDatum[] = (() => {
  const atLeast = (stages: LeadStatus[]) =>
    leads.filter((l) => stages.includes(l.status)).length;
  return [
    {
      label: "Total Leads",
      value: totalLeads,
    },
    {
      label: "Contacted",
      value: atLeast([
        "Contacted",
        "Interested",
        "Follow-up",
        "Qualified",
        "Proposal",
        "Negotiation",
        "Won",
      ]),
    },
    {
      label: "Interested",
      value: atLeast([
        "Interested",
        "Qualified",
        "Proposal",
        "Negotiation",
        "Won",
      ]),
    },
    {
      label: "Qualified",
      value: atLeast(["Qualified", "Proposal", "Negotiation", "Won"]),
    },
    { label: "Proposal", value: atLeast(["Proposal", "Negotiation", "Won"]) },
    { label: "Won", value: wonLeads },
  ];
})();

export const employeePerformance: CategoryDatum[] = employees
  .filter((e) => e.role !== "Viewer")
  .map((e) => ({ label: e.name.split(" ")[0], value: e.stats.performance }))
  .sort((a, b) => b.value - a.value);

export const callsByEmployee: CategoryDatum[] = employees
  .filter((e) => e.role !== "Viewer")
  .map((e) => ({ label: e.name.split(" ")[0], value: e.stats.calls }))
  .sort((a, b) => b.value - a.value);

export const leadsByEmployee: CategoryDatum[] = employees
  .filter((e) => e.role !== "Viewer")
  .map((e) => ({ label: e.name.split(" ")[0], value: e.stats.leadsAssigned }))
  .sort((a, b) => b.value - a.value);

/* ------------------------------------------------------------------ */
/* Today's follow-ups (dashboard widget)                               */
/* ------------------------------------------------------------------ */

export const todaysFollowUps: FollowUp[] = followUps
  .filter((f) => f.date === TODAY)
  .sort((a, b) => a.time.localeCompare(b.time));

/* ------------------------------------------------------------------ */
/* Per-lead activity timeline (derived)                                */
/* ------------------------------------------------------------------ */

export interface ActivityEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: "lead" | "assign" | "call" | "status" | "followup" | "note" | "email";
}

export function activityForLead(leadId: string): ActivityEvent[] {
  const lead = leads.find((l) => l.id === leadId);
  if (!lead) return [];
  const events: ActivityEvent[] = [
    {
      id: `${leadId}-created`,
      date: lead.createdDate,
      title: "Lead created",
      description: `Sourced via ${lead.source}`,
      type: "lead",
    },
    {
      id: `${leadId}-assigned`,
      date: lead.createdDate,
      title: `Assigned to ${lead.assignedTo}`,
      description: "Ownership set by the routing rules",
      type: "assign",
    },
  ];

  for (const call of calls
    .filter((c) => c.leadId === leadId)
    .sort((a, b) => (a.date < b.date ? -1 : 1))) {
    events.push({
      id: `${call.id}-event`,
      date: call.date.slice(0, 10),
      title: `Call — ${call.status}`,
      description: call.remarks,
      type: "call",
    });
    if (call.interest) {
      events.push({
        id: `${call.id}-interest`,
        date: call.date.slice(0, 10),
        title: `Interest marked ${call.interest}`,
        description: "Updated from call outcome",
        type: "status",
      });
    }
  }

  for (const fu of followUps.filter((f) => f.leadId === leadId)) {
    events.push({
      id: `${fu.id}-event`,
      date: fu.date,
      title:
        fu.status === "Completed"
          ? "Follow-up completed"
          : fu.status === "Missed"
            ? "Follow-up missed"
            : "Follow-up scheduled",
      description: `${fu.reason} · ${fu.time}`,
      type: "followup",
    });
  }

  events.push({
    id: `${leadId}-status`,
    date: lead.lastContact,
    title: `Status: ${lead.status}`,
    description: `Interest level ${lead.interest}`,
    type: "status",
  });

  return events.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/* ------------------------------------------------------------------ */
/* Global search                                                       */
/* ------------------------------------------------------------------ */

export interface SearchResult {
  id: string;
  type: "Lead" | "Company" | "Contact";
  title: string;
  subtitle: string;
  href: string;
}

export function globalSearch(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: SearchResult[] = [];

  for (const c of companies) {
    if (c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q)) {
      results.push({
        id: c.id,
        type: "Company",
        title: c.name,
        subtitle: `${c.industry} · ${c.city}`,
        href: `/companies/${c.id}`,
      });
    }
  }
  for (const c of contacts) {
    if (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q)
    ) {
      results.push({
        id: c.id,
        type: "Contact",
        title: c.name,
        subtitle: `${c.designation} · ${c.companyName}`,
        href: `/contacts?q=${encodeURIComponent(c.name)}`,
      });
    }
  }
  for (const l of leads) {
    if (
      l.companyName.toLowerCase().includes(q) ||
      l.contactName.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      l.id.toLowerCase().includes(q)
    ) {
      results.push({
        id: l.id,
        type: "Lead",
        title: `${l.companyName} — ${l.contactName}`,
        subtitle: `${l.id} · ${l.status}`,
        href: `/leads/${l.id}`,
      });
    }
  }
  return results.slice(0, 20);
}

/* ------------------------------------------------------------------ */
/* Re-exports                                                          */
/* ------------------------------------------------------------------ */

export {
  companies,
  contacts,
  leads,
  calls,
  followUps,
  employees,
  notifications,
  currentUser,
  industries,
};

export type { Call, FollowUp, Lead };
