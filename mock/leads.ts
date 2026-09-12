import type {
  InterestLevel,
  Lead,
  LeadSource,
  LeadStatus,
  Priority,
} from "@/lib/types";
import { LEAD_SOURCES, PRIORITIES } from "@/lib/constants";
import { seededRandom, pick } from "@/lib/utils";
import { companies } from "./companies";
import { contacts } from "./contacts";
import { assignableEmployees } from "./employees";

/** Target status distribution - shapes a believable conversion funnel. */
const STATUS_PLAN: LeadStatus[] = [
  ...Array<LeadStatus>(8).fill("New"),
  ...Array<LeadStatus>(7).fill("Contacted"),
  ...Array<LeadStatus>(6).fill("Interested"),
  ...Array<LeadStatus>(5).fill("Follow-up"),
  ...Array<LeadStatus>(5).fill("Qualified"),
  ...Array<LeadStatus>(3).fill("Proposal"),
  ...Array<LeadStatus>(3).fill("Negotiation"),
  ...Array<LeadStatus>(5).fill("Won"),
  ...Array<LeadStatus>(2).fill("Lost"),
  ...Array<LeadStatus>(3).fill("Not Interested"),
];

const rand = seededRandom(90217);

/** Deterministic Fisher-Yates shuffle. */
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function interestFor(status: LeadStatus): InterestLevel {
  switch (status) {
    case "Interested":
    case "Qualified":
    case "Proposal":
    case "Negotiation":
    case "Won":
      return rand() > 0.35 ? "High" : "Medium";
    case "Follow-up":
    case "Contacted":
      return rand() > 0.5 ? "Medium" : "Low";
    case "Not Interested":
    case "Lost":
      return "Not Interested";
    default:
      return rand() > 0.6 ? "Low" : "Medium";
  }
}

function priorityFor(status: LeadStatus): Priority {
  if (status === "Qualified" || status === "Negotiation" || status === "Proposal")
    return rand() > 0.4 ? "High" : "Medium";
  if (status === "Not Interested" || status === "Lost") return "Low";
  return pick(PRIORITIES, rand);
}

/** ISO date `days` before 2026-09-07. */
function daysAgo(days: number): string {
  const base = new Date("2026-09-07T00:00:00Z");
  base.setUTCDate(base.getUTCDate() - days);
  return base.toISOString().slice(0, 10);
}

function nextFollowUpFor(status: LeadStatus, index: number): string | null {
  const active: LeadStatus[] = [
    "Contacted",
    "Interested",
    "Follow-up",
    "Qualified",
    "Proposal",
    "Negotiation",
  ];
  if (!active.includes(status)) return null;
  // Spread: some overdue, several today, the rest upcoming.
  const bucket = index % 5;
  if (bucket === 0) return daysAgo(1 + (index % 3)); // overdue
  if (bucket === 1 || bucket === 2) return "2026-09-07"; // today
  return daysAgo(-(1 + (index % 6))); // upcoming
}

const statuses = shuffle(STATUS_PLAN);  

export const leads: Lead[] = statuses.map((status, i) => {
  const company = companies[i % companies.length];
  const companyContacts = contacts.filter((c) => c.companyId === company.id);
  const contact = companyContacts[i % companyContacts.length];
  const employee = assignableEmployees[i % assignableEmployees.length];
  const created = daysAgo(8 + Math.floor(rand() * 260));
  const lastContact = daysAgo(Math.floor(rand() * 12));
  const source = pick(LEAD_SOURCES, rand) as LeadSource;
  const value = (5 + Math.floor(rand() * 120)) * 10000;

  return {
    id: `LEAD-${String(1000 + i).padStart(4, "0")}`,
    companyId: company.id,
    companyName: company.name,
    contactId: contact.id,
    contactName: contact.name,
    designation: contact.designation,
    industry: company.industry,
    phone: contact.phone,
    email: contact.email,
    website: company.website,
    city: company.city,
    state: company.state,
    status,
    interest: interestFor(status),
    source,
    priority: priorityFor(status),
    assignedTo: employee.name,
    assignedToId: employee.id,
    value,
    createdDate: created,
    lastContact,
    nextFollowUp: nextFollowUpFor(status, i),
    notes:
      "Introduced MyTechz aggregated lead offering. Awaiting confirmation on requirement volume and budget cycle.",
  };
});

export function leadsByCompany(companyId: string): Lead[] {
  return leads.filter((l) => l.companyId === companyId);
}

export function leadById(id: string): Lead | undefined {
  return leads.find((l) => l.id === id);

}