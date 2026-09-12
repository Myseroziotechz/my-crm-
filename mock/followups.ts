import type { FollowUp, FollowUpStatus } from "@/lib/types";
import { seededRandom, pick, TODAY_ISO } from "@/lib/utils";
import { leads } from "./leads";
import { employees } from "./employees";

const rand = seededRandom(73311);

const REASONS = [
  "Send proposal document",
  "Confirm budget approval",
  "Product demo call",
  "Discuss contract terms",
  "Follow up on brochure",
  "Reconnect after quarterly planning",
  "Share pricing breakdown",
  "Check decision timeline",
];

const TIMES = [
  "09:30 AM",
  "10:30 AM",
  "11:00 AM",
  "12:15 PM",
  "02:00 PM",
  "03:30 PM",
  "04:45 PM",
  "05:30 PM",
];

function shiftDate(days: number): string {
  const d = new Date(`${TODAY_ISO}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Build follow-ups from leads that carry a nextFollowUp, then add a
 * handful of completed / cancelled historical ones.
 */
export const followUps: FollowUp[] = [];

let counter = 1;

for (const lead of leads) {
  if (!lead.nextFollowUp) continue;
  const employee =
    employees.find((e) => e.id === lead.assignedToId) ?? employees[0];
  let status: FollowUpStatus = "Pending";
  if (lead.nextFollowUp < TODAY_ISO) status = rand() > 0.5 ? "Missed" : "Pending";

  followUps.push({
    id: `FU-${String(counter).padStart(4, "0")}`,
    leadId: lead.id,
    companyId: lead.companyId,
    companyName: lead.companyName,
    contactId: lead.contactId,
    contactName: lead.contactName,
    employeeId: employee.id,
    employeeName: employee.name,
    date: lead.nextFollowUp,
    time: pick(TIMES, rand),
    reason: pick(REASONS, rand),
    status,
    notes: "",
  });
  counter++;
}

// Historical completed / cancelled follow-ups for a fuller timeline.
for (let i = 0; i < 14; i++) {
  const lead = leads[Math.floor(rand() * leads.length)];
  const employee =
    employees.find((e) => e.id === lead.assignedToId) ?? employees[0];
  const status: FollowUpStatus = rand() > 0.25 ? "Completed" : "Cancelled";
  followUps.push({
    id: `FU-${String(counter).padStart(4, "0")}`,
    leadId: lead.id,
    companyId: lead.companyId,
    companyName: lead.companyName,
    contactId: lead.contactId,
    contactName: lead.contactName,
    employeeId: employee.id,
    employeeName: employee.name,
    date: shiftDate(-(2 + Math.floor(rand() * 20))),
    time: pick(TIMES, rand),
    reason: pick(REASONS, rand),
    status,
    notes:
      status === "Completed"
        ? "Call completed, notes added to the lead timeline."
        : "Prospect postponed indefinitely.",
  });
  counter++;
}

followUps.sort((a, b) => (a.date < b.date ? -1 : 1));

export function followUpsByLead(leadId: string): FollowUp[] {
  return followUps.filter((f) => f.leadId === leadId);
}

export function followUpsByCompany(companyId: string): FollowUp[] {
  return followUps.filter((f) => f.companyId === companyId);
}
