import { createClient } from "./server";
import type { ActivityEvent } from "@/mock";
import type { Call, Company, Contact, FollowUp, Lead, LeadStatus } from "@/lib/types";
import { INDUSTRIES, LEAD_STATUSES } from "@/lib/constants";
import { formatTime } from "@/lib/utils";

/** Supabase returns a to-one embed as an object, but normalise defensively in case it's an array. */
function one<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export interface EmployeeOption {
  id: string;
  name: string;
}

export interface CompanyOption {
  id: string;
  name: string;
}

export interface LeadOption {
  id: string;
  companyName: string;
  contactName: string;
}

export async function getAssignableEmployees(): Promise<EmployeeOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employees")
    .select("id, name")
    .neq("role", "Viewer")
    .eq("active", true)
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getCompanyOptions(): Promise<CompanyOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .select("id, name")
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getLeadOptions(): Promise<LeadOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("id, companies ( name ), contacts ( name )")
    .order("created_date", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    companyName: one(row.companies)?.name ?? "",
    contactName: one(row.contacts)?.name ?? "",
  }));
}

const LEAD_SELECT = `
  id, company_id, contact_id, designation, industry, phone, email, website, city, state,
  status, interest, source, priority, assigned_to_id, value, created_date, last_contact, next_follow_up, notes,
  companies ( name ),
  contacts ( name ),
  employees ( name )
`;

type LeadRow = {
  id: string;
  company_id: string;
  contact_id: string;
  designation: string | null;
  industry: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  city: string | null;
  state: string | null;
  status: string;
  interest: string | null;
  source: string | null;
  priority: string;
  assigned_to_id: string | null;
  value: number;
  created_date: string;
  last_contact: string | null;
  next_follow_up: string | null;
  notes: string | null;
  companies: { name: string } | { name: string }[] | null;
  contacts: { name: string } | { name: string }[] | null;
  employees: { name: string } | { name: string }[] | null;
};

function mapLead(row: LeadRow): Lead {
  const company = one(row.companies);
  const contact = one(row.contacts);
  const employee = one(row.employees);
  return {
    id: row.id,
    companyId: row.company_id,
    companyName: company?.name ?? "",
    contactId: row.contact_id,
    contactName: contact?.name ?? "",
    designation: row.designation ?? "",
    industry: row.industry as Lead["industry"],
    phone: row.phone ?? "",
    email: row.email ?? "",
    website: row.website ?? "",
    city: row.city ?? "",
    state: row.state ?? "",
    status: row.status as Lead["status"],
    interest: (row.interest ?? "Not Interested") as Lead["interest"],
    source: (row.source ?? "Website") as Lead["source"],
    priority: row.priority as Lead["priority"],
    assignedTo: employee?.name ?? "Unassigned",
    assignedToId: row.assigned_to_id ?? "",
    value: Number(row.value ?? 0),
    createdDate: row.created_date,
    lastContact: row.last_contact ?? row.created_date,
    nextFollowUp: row.next_follow_up,
    notes: row.notes ?? "",
  };
}

export async function getLeads(): Promise<Lead[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(LEAD_SELECT)
    .order("created_date", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as LeadRow[]).map(mapLead);
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(LEAD_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapLead(data as unknown as LeadRow) : null;
}

const LEAD_CONTEXT_EMBED = `
  company_id, contact_id,
  companies ( name ),
  contacts ( name )
`;

type LeadContextRow = {
  company_id: string;
  contact_id: string;
  companies: { name: string } | { name: string }[] | null;
  contacts: { name: string } | { name: string }[] | null;
};

const FOLLOWUP_SELECT = `
  id, lead_id, employee_id, date, time, reason, status, notes,
  leads ( ${LEAD_CONTEXT_EMBED} ),
  employees ( name )
`;

type FollowUpRow = {
  id: string;
  lead_id: string;
  employee_id: string | null;
  date: string;
  time: string | null;
  reason: string | null;
  status: string;
  notes: string | null;
  leads: LeadContextRow | LeadContextRow[] | null;
  employees: { name: string } | { name: string }[] | null;
};

function mapFollowUp(row: FollowUpRow): FollowUp {
  const lead = one(row.leads);
  const company = lead ? one(lead.companies) : null;
  const contact = lead ? one(lead.contacts) : null;
  const employee = one(row.employees);
  return {
    id: row.id,
    leadId: row.lead_id,
    companyId: lead?.company_id ?? "",
    companyName: company?.name ?? "",
    contactId: lead?.contact_id ?? "",
    contactName: contact?.name ?? "",
    employeeId: row.employee_id ?? "",
    employeeName: employee?.name ?? "Unassigned",
    date: row.date,
    time: row.time ?? "",
    reason: row.reason ?? "",
    status: row.status as FollowUp["status"],
    notes: row.notes ?? "",
  };
}

export async function getFollowUps(): Promise<FollowUp[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("follow_ups")
    .select(FOLLOWUP_SELECT)
    .order("date", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as FollowUpRow[]).map(mapFollowUp);
}

export async function getFollowUpsForLead(leadId: string): Promise<FollowUp[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("follow_ups")
    .select(FOLLOWUP_SELECT)
    .eq("lead_id", leadId)
    .order("date", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as FollowUpRow[]).map(mapFollowUp);
}

export async function getFollowUpsForLeadIds(leadIds: string[]): Promise<FollowUp[]> {
  if (leadIds.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("follow_ups")
    .select(FOLLOWUP_SELECT)
    .in("lead_id", leadIds)
    .order("date", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as FollowUpRow[]).map(mapFollowUp);
}

const CALL_SELECT = `
  id, lead_id, employee_id, occurred_at, status, interest, duration_seconds, remarks,
  leads ( ${LEAD_CONTEXT_EMBED} ),
  employees ( name )
`;

type CallRow = {
  id: string;
  lead_id: string;
  employee_id: string | null;
  occurred_at: string;
  status: string;
  interest: string | null;
  duration_seconds: number;
  remarks: string | null;
  leads: LeadContextRow | LeadContextRow[] | null;
  employees: { name: string } | { name: string }[] | null;
};

function mapCall(row: CallRow): Call {
  const lead = one(row.leads);
  const company = lead ? one(lead.companies) : null;
  const contact = lead ? one(lead.contacts) : null;
  const employee = one(row.employees);
  return {
    id: row.id,
    leadId: row.lead_id,
    companyId: lead?.company_id ?? "",
    companyName: company?.name ?? "",
    contactId: lead?.contact_id ?? "",
    contactName: contact?.name ?? "",
    employeeId: row.employee_id ?? "",
    employeeName: employee?.name ?? "Unassigned",
    date: row.occurred_at,
    status: row.status as Call["status"],
    interest: row.interest as Call["interest"],
    duration: row.duration_seconds,
    remarks: row.remarks ?? "",
  };
}

export async function getCallsForLead(leadId: string): Promise<Call[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("calls")
    .select(CALL_SELECT)
    .eq("lead_id", leadId)
    .order("occurred_at", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as CallRow[]).map(mapCall);
}

export async function getCallsForLeadIds(leadIds: string[]): Promise<Call[]> {
  if (leadIds.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("calls")
    .select(CALL_SELECT)
    .in("lead_id", leadIds)
    .order("occurred_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as CallRow[]).map(mapCall);
}

/* ------------------------------------------------------------------ */
/* Companies & contacts                                                */
/* ------------------------------------------------------------------ */

const COMPANY_SELECT = `
  id, name, industry, website, phone, email, address, city, state, country, status, last_contact, created_date
`;

type CompanyRow = {
  id: string;
  name: string;
  industry: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  status: string;
  last_contact: string | null;
  created_date: string;
};

function mapCompany(row: CompanyRow, contactCount: number, leadCount: number): Company {
  return {
    id: row.id,
    name: row.name,
    industry: row.industry as Company["industry"],
    website: row.website ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    address: row.address ?? "",
    city: row.city ?? "",
    state: row.state ?? "",
    country: row.country ?? "",
    status: row.status as Company["status"],
    contactCount,
    leadCount,
    lastContact: row.last_contact ?? row.created_date,
    createdDate: row.created_date,
  };
}

/** Counts rows per `company_id` — used to fill in list-page contact/lead counts without an N+1 query per row. */
function countByCompany(rows: { company_id: string }[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of rows) counts.set(row.company_id, (counts.get(row.company_id) ?? 0) + 1);
  return counts;
}

export async function getCompanies(): Promise<Company[]> {
  const supabase = await createClient();
  const [companiesResult, contactsResult, leadsResult] = await Promise.all([
    supabase.from("companies").select(COMPANY_SELECT).order("name"),
    supabase.from("contacts").select("company_id"),
    supabase.from("leads").select("company_id"),
  ]);
  if (companiesResult.error) throw new Error(companiesResult.error.message);
  if (contactsResult.error) throw new Error(contactsResult.error.message);
  if (leadsResult.error) throw new Error(leadsResult.error.message);

  const contactCounts = countByCompany(contactsResult.data ?? []);
  const leadCounts = countByCompany(leadsResult.data ?? []);

  return ((companiesResult.data ?? []) as CompanyRow[]).map((row) =>
    mapCompany(row, contactCounts.get(row.id) ?? 0, leadCounts.get(row.id) ?? 0),
  );
}

/** Counts aren't filled in here — the detail page derives them from the contacts/leads it fetches anyway. */
export async function getCompanyById(id: string): Promise<Company | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .select(COMPANY_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapCompany(data as CompanyRow, 0, 0) : null;
}

const CONTACT_SELECT = `
  id, company_id, name, designation, phone, email, industry, city, lead_status, is_primary, created_date,
  companies ( name )
`;

type ContactRow = {
  id: string;
  company_id: string;
  name: string;
  designation: string | null;
  phone: string | null;
  email: string | null;
  industry: string | null;
  city: string | null;
  lead_status: string | null;
  is_primary: boolean;
  created_date: string;
  companies: { name: string } | { name: string }[] | null;
};

function mapContact(row: ContactRow): Contact {
  const company = one(row.companies);
  return {
    id: row.id,
    name: row.name,
    companyId: row.company_id,
    companyName: company?.name ?? "",
    designation: row.designation ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    industry: (row.industry ?? "") as Contact["industry"],
    city: row.city ?? "",
    leadStatus: (row.lead_status ?? "New") as Contact["leadStatus"],
    isPrimary: row.is_primary,
    createdDate: row.created_date,
  };
}

export async function getContactsForCompany(companyId: string): Promise<Contact[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select(CONTACT_SELECT)
    .eq("company_id", companyId)
    .order("is_primary", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as ContactRow[]).map(mapContact);
}

export async function getLeadsForCompany(companyId: string): Promise<Lead[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(LEAD_SELECT)
    .eq("company_id", companyId)
    .order("created_date", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as LeadRow[]).map(mapLead);
}

/** Merge a lead's calls + follow-ups into a chronological activity timeline (mirrors mock/index.ts). */
export function getActivityForLead(
  lead: Lead,
  calls: Call[],
  followUps: FollowUp[],
): ActivityEvent[] {
  const events: ActivityEvent[] = [
    {
      id: `${lead.id}-created`,
      date: lead.createdDate,
      title: "Lead created",
      description: `Sourced via ${lead.source}`,
      type: "lead",
    },
    {
      id: `${lead.id}-assigned`,
      date: lead.createdDate,
      title: `Assigned to ${lead.assignedTo}`,
      description: "Ownership set at creation",
      type: "assign",
    },
  ];

  for (const call of calls) {
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

  for (const fu of followUps) {
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
    id: `${lead.id}-status`,
    date: lead.lastContact,
    title: `Status: ${lead.status}`,
    description: `Interest level ${lead.interest}`,
    type: "status",
  });

  return events.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

export interface DashboardKpi {
  key: string;
  label: string;
  value: string;
  delta: number;
  trend: "up" | "down" | "neutral";
}

export interface CategoryDatum {
  label: string;
  value: number;
}

export interface DashboardData {
  kpis: DashboardKpi[];
  leadsByIndustry: CategoryDatum[];
  leadStatusDistribution: CategoryDatum[];
  callsPerDay: CategoryDatum[];
  interestedVsNot: CategoryDatum[];
  conversionFunnel: CategoryDatum[];
  employeePerformance: CategoryDatum[];
  todaysFollowUps: FollowUp[];
}

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

/** % change of `current` vs `previous`; neutral/0 when there's nothing to compare against. */
function periodDelta(current: number, previous: number): { delta: number; trend: DashboardKpi["trend"] } {
  if (previous === 0) return { delta: 0, trend: "neutral" };
  const pct = Math.round(((current - previous) / previous) * 1000) / 10;
  return { delta: Math.abs(pct), trend: pct > 0 ? "up" : pct < 0 ? "down" : "neutral" };
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = daysAgoIso(30);
  const sixtyDaysAgo = daysAgoIso(60);

  const [leads, followUps, callsResult, employeesResult] = await Promise.all([
    getLeads(),
    getFollowUps(),
    supabase.from("calls").select("employee_id, occurred_at"),
    supabase.from("employees").select("id, name").neq("role", "Viewer"),
  ]);
  if (callsResult.error) throw new Error(callsResult.error.message);
  if (employeesResult.error) throw new Error(employeesResult.error.message);
  const calls = callsResult.data ?? [];
  const performers = employeesResult.data ?? [];

  const inLast30 = (l: Lead) => l.createdDate >= thirtyDaysAgo;
  const inPrior30 = (l: Lead) => l.createdDate >= sixtyDaysAgo && l.createdDate < thirtyDaysAgo;

  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === "New").length;
  const interestedLeads = leads.filter((l) => l.status === "Interested").length;
  const qualifiedLeads = leads.filter((l) =>
    (["Qualified", "Proposal", "Negotiation"] as LeadStatus[]).includes(l.status),
  ).length;
  const wonLeads = leads.filter((l) => l.status === "Won").length;
  const notInterested = leads.filter(
    (l) => l.status === "Not Interested" || l.status === "Lost",
  ).length;
  const followUpsToday = followUps.filter(
    (f) => f.date === today && f.status === "Pending",
  ).length;
  const conversionRate = totalLeads ? Math.round((wonLeads / totalLeads) * 1000) / 10 : 0;

  const totalDelta = periodDelta(
    leads.filter(inLast30).length,
    leads.filter(inPrior30).length,
  );

  const kpis: DashboardKpi[] = [
    { key: "total", label: "Total Leads", value: String(totalLeads), delta: totalDelta.delta, trend: totalDelta.trend },
    { key: "new", label: "New Leads", value: String(newLeads), delta: 0, trend: "neutral" },
    { key: "interested", label: "Interested Leads", value: String(interestedLeads), delta: 0, trend: "neutral" },
    { key: "followups", label: "Follow-ups Today", value: String(followUpsToday), delta: 0, trend: "neutral" },
    { key: "qualified", label: "Qualified Leads", value: String(qualifiedLeads), delta: 0, trend: "neutral" },
    { key: "won", label: "Won Leads", value: String(wonLeads), delta: 0, trend: "neutral" },
    { key: "notInterested", label: "Not Interested", value: String(notInterested), delta: 0, trend: "neutral" },
    { key: "conversion", label: "Conversion Rate", value: `${conversionRate}%`, delta: 0, trend: "neutral" },
  ];

  const leadsByIndustry: CategoryDatum[] = INDUSTRIES.map((ind) => ({
    label: ind,
    value: leads.filter((l) => l.industry === ind).length,
  })).filter((d) => d.value > 0);

  const leadStatusDistribution: CategoryDatum[] = LEAD_STATUSES.map((s) => ({
    label: s,
    value: leads.filter((l) => l.status === s).length,
  })).filter((d) => d.value > 0);

  const callsPerDay: CategoryDatum[] = (() => {
    const buckets: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) buckets[daysAgoIso(i)] = 0;
    for (const call of calls) {
      const day = (call.occurred_at ?? "").slice(0, 10);
      if (day in buckets) buckets[day] += 1;
    }
    return Object.entries(buckets).map(([day, value]) => ({
      label: day.slice(5),
      value,
    }));
  })();

  const interestedVsNot: CategoryDatum[] = [
    {
      label: "Interested",
      value: leads.filter((l) =>
        (["Interested", "Qualified", "Proposal", "Negotiation", "Won"] as LeadStatus[]).includes(l.status),
      ).length,
    },
    {
      label: "Not Interested",
      value: leads.filter((l) => l.status === "Not Interested" || l.status === "Lost").length,
    },
    {
      label: "Undecided",
      value: leads.filter((l) =>
        (["New", "Contacted", "Follow-up"] as LeadStatus[]).includes(l.status),
      ).length,
    },
  ];

  const conversionFunnel: CategoryDatum[] = (() => {
    const atLeast = (stages: LeadStatus[]) =>
      leads.filter((l) => stages.includes(l.status)).length;
    return [
      { label: "Total Leads", value: totalLeads },
      {
        label: "Contacted",
        value: atLeast(["Contacted", "Interested", "Follow-up", "Qualified", "Proposal", "Negotiation", "Won"]),
      },
      { label: "Interested", value: atLeast(["Interested", "Qualified", "Proposal", "Negotiation", "Won"]) },
      { label: "Qualified", value: atLeast(["Qualified", "Proposal", "Negotiation", "Won"]) },
      { label: "Proposal", value: atLeast(["Proposal", "Negotiation", "Won"]) },
      { label: "Won", value: wonLeads },
    ];
  })();

  const employeeScores = performers
    .map((e) => {
      const own = leads.filter((l) => l.assignedToId === e.id);
      const empCalls = calls.filter((c) => c.employee_id === e.id);
      const won = own.filter((l) => l.status === "Won").length;
      const qualified = own.filter((l) =>
        (["Qualified", "Proposal", "Negotiation", "Won"] as LeadStatus[]).includes(l.status),
      ).length;
      const interested = own.filter((l) =>
        (["Interested", "Qualified", "Proposal", "Negotiation", "Won"] as LeadStatus[]).includes(l.status),
      ).length;
      const score = won * 5 + qualified * 3 + interested * 1.5 + empCalls.length * 0.4;
      return { label: e.name.split(" ")[0], score };
    })
    .sort((a, b) => b.score - a.score);
  const maxScore = Math.max(...employeeScores.map((e) => e.score), 1);
  const employeePerformanceData: CategoryDatum[] = employeeScores.map((e) => ({
    label: e.label,
    value: Math.round((e.score / maxScore) * 100),
  }));

  const todaysFollowUps = followUps
    .filter((f) => f.date === today)
    .sort((a, b) => a.time.localeCompare(b.time))
    .map((f) => ({ ...f, time: formatTime(f.time) }));

  return {
    kpis,
    leadsByIndustry,
    leadStatusDistribution,
    callsPerDay,
    interestedVsNot,
    conversionFunnel,
    employeePerformance: employeePerformanceData,
    todaysFollowUps,
  };
}
