import type { Call, CallStatus, InterestLevel } from "@/lib/types";
import { seededRandom, pick } from "@/lib/utils";
import { leads } from "./leads";
import { employees } from "./employees";

const rand = seededRandom(55123);

const CALL_STATUS_POOL: CallStatus[] = [
  "Answered",
  "Answered",
  "Answered",
  "No Answer",
  "Busy",
  "Call Back",
  "Wrong Number",
];

const REMARKS_ANSWERED = [
  "Spoke to decision maker. Wants a detailed proposal by next week.",
  "Discussed pricing tiers. Budget approval expected this month.",
  "Positive conversation. Sharing brochure and case studies over email.",
  "Requirement confirmed. Scheduling a product walkthrough.",
  "Asked to reconnect after their quarterly planning.",
];
const REMARKS_OTHER = [
  "Did not pick up. Will retry in the evening.",
  "Line busy, left a WhatsApp message.",
  "Requested a callback tomorrow morning.",
  "Number belongs to a different department.",
  "Reception took a message for the manager.",
];

function timeAt(daysAgo: number, hour: number, minute: number): string {
  const d = new Date("2026-09-07T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - daysAgo);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString();
}

/** ~62 calls across the last two weeks, weighted toward active leads. */
export const calls: Call[] = [];

let counter = 1;
for (let i = 0; i < 62; i++) {
  const lead = leads[Math.floor(rand() * leads.length)];
  const employee =
    employees.find((e) => e.id === lead.assignedToId) ?? employees[0];
  const status = pick(CALL_STATUS_POOL, rand);
  const answered = status === "Answered";
  const interest: InterestLevel | null = answered
    ? lead.interest
    : null;
  const daysBack = Math.floor(rand() * 14);
  const hour = 9 + Math.floor(rand() * 9);
  const minute = Math.floor(rand() * 60);

  calls.push({
    id: `CALL-${String(counter).padStart(4, "0")}`,
    leadId: lead.id,
    companyId: lead.companyId,
    companyName: lead.companyName,
    contactId: lead.contactId,
    contactName: lead.contactName,
    employeeId: employee.id,
    employeeName: employee.name,
    date: timeAt(daysBack, hour, minute),
    status,
    interest,
    duration: answered ? 45 + Math.floor(rand() * 520) : Math.floor(rand() * 20),
    remarks: answered ? pick(REMARKS_ANSWERED, rand) : pick(REMARKS_OTHER, rand),
  });
  counter++;
}

calls.sort((a, b) => (a.date < b.date ? 1 : -1));

export function callsByLead(leadId: string): Call[] {
  return calls.filter((c) => c.leadId === leadId);
}

export function callsByCompany(companyId: string): Call[] {
  return calls.filter((c) => c.companyId === companyId);
}
