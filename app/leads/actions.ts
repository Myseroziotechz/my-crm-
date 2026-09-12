"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { INDUSTRIES, LEAD_SOURCES, PRIORITIES } from "@/lib/constants";

export interface CreateLeadInput {
  companyName: string;
  industry: string;
  website: string;
  companyPhone: string;
  city: string;
  state: string;
  contactName: string;
  designation: string;
  phone: string;
  email: string;
  source: string;
  priority: string;
  assigneeId: string;
  notes: string;
}

export type CreateLeadResult = { id: string } | { error: string };

export async function createLead(
  input: CreateLeadInput,
): Promise<CreateLeadResult> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: company, error: companyErr } = await supabase
    .from("companies")
    .insert({
      name: input.companyName,
      industry: input.industry,
      website: input.website || null,
      phone: input.companyPhone || null,
      city: input.city || null,
      state: input.state || null,
      status: "Prospect",
    })
    .select("id")
    .single();
  if (companyErr || !company) {
    return { error: companyErr?.message ?? "Failed to create company." };
  }

  const { data: contact, error: contactErr } = await supabase
    .from("contacts")
    .insert({
      company_id: company.id,
      name: input.contactName,
      designation: input.designation || null,
      phone: input.phone || null,
      email: input.email || null,
      industry: input.industry,
      city: input.city || null,
      lead_status: "New",
      is_primary: true,
    })
    .select("id")
    .single();
  if (contactErr || !contact) {
    return { error: contactErr?.message ?? "Failed to create contact." };
  }

  const { data: lead, error: leadErr } = await supabase
    .from("leads")
    .insert({
      company_id: company.id,
      contact_id: contact.id,
      designation: input.designation || null,
      industry: input.industry,
      phone: input.phone || null,
      email: input.email || null,
      website: input.website || null,
      city: input.city || null,
      state: input.state || null,
      status: "New",
      source: input.source,
      priority: input.priority,
      assigned_to_id: input.assigneeId || null,
      last_contact: today,
      notes: input.notes || null,
    })
    .select("id")
    .single();
  if (leadErr || !lead) {
    return { error: leadErr?.message ?? "Failed to create lead." };
  }

  revalidatePath("/leads");
  return { id: lead.id };
}

export interface ImportRow {
  companyName: string;
  industry: string;
  website: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  contactName: string;
  designation: string;
  source: string;
  priority: string;
  notes: string;
}

export interface ImportSkip {
  row: number;
  reason: string;
}

export interface ImportSummary {
  companiesCreated: number;
  companiesReused: number;
  contactsCreated: number;
  leadsCreated: number;
  skipped: ImportSkip[];
  mappedValues: { row: number; field: string; from: string; to: string }[];
}

export type ImportLeadsResult = ImportSummary | { error: string };

/** Strip everything but letters/digits so "Health Care" and "Healthcare" compare equal. */
function normalizeForCompare(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Snap a free-text value to the closest allowed option (exact, then loose match), else fall back. */
function normalizeEnum(
  value: string,
  allowed: readonly string[],
  fallback: string,
): { value: string; changed: boolean } {
  const v = value.trim();
  if (!v) return { value: fallback, changed: false };
  const exact = allowed.find((a) => a.toLowerCase() === v.toLowerCase());
  if (exact) return { value: exact, changed: exact !== v };
  const normV = normalizeForCompare(v);
  const loose = allowed.find((a) => normalizeForCompare(a) === normV);
  if (loose) return { value: loose, changed: true };
  const partial = allowed.find((a) => {
    const normA = normalizeForCompare(a);
    return normA.includes(normV) || normV.includes(normA);
  });
  return { value: partial ?? fallback, changed: true };
}

export async function importLeads(rows: ImportRow[]): Promise<ImportLeadsResult> {
  if (rows.length === 0) return { error: "No rows to import." };
  if (rows.length > 1000) return { error: "Import is capped at 1000 rows at a time." };

  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: existingCompanies, error: fetchErr } = await supabase
    .from("companies")
    .select("id, name");
  if (fetchErr) return { error: fetchErr.message };

  const companyByName = new Map<string, string>(
    (existingCompanies ?? []).map((c) => [c.name.trim().toLowerCase(), c.id]),
  );

  const summary: ImportSummary = {
    companiesCreated: 0,
    companiesReused: 0,
    contactsCreated: 0,
    leadsCreated: 0,
    skipped: [],
    mappedValues: [],
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;

    if (!row.companyName.trim() || !row.contactName.trim() || !row.phone.trim()) {
      summary.skipped.push({
        row: rowNum,
        reason: "Missing required field (company name, contact name, or phone).",
      });
      continue;
    }

    const industry = normalizeEnum(row.industry, INDUSTRIES, "Other");
    if (industry.changed) {
      summary.mappedValues.push({
        row: rowNum,
        field: "Industry",
        from: row.industry,
        to: industry.value,
      });
    }
    const source = normalizeEnum(row.source, LEAD_SOURCES, "Website");
    if (source.changed) {
      summary.mappedValues.push({
        row: rowNum,
        field: "Source",
        from: row.source,
        to: source.value,
      });
    }
    const priority = normalizeEnum(row.priority, PRIORITIES, "Medium");

    const key = row.companyName.trim().toLowerCase();
    let companyId = companyByName.get(key);
    if (!companyId) {
      const { data: company, error } = await supabase
        .from("companies")
        .insert({
          name: row.companyName.trim(),
          industry: industry.value,
          website: row.website || null,
          phone: row.phone || null,
          city: row.city || null,
          state: row.state || null,
          status: "Prospect",
        })
        .select("id")
        .single();
      if (error || !company) {
        summary.skipped.push({
          row: rowNum,
          reason: error?.message ?? "Failed to create company.",
        });
        continue;
      }
      companyId = company.id as string;
      companyByName.set(key, companyId);
      summary.companiesCreated++;
    } else {
      summary.companiesReused++;
    }

    const { data: contact, error: contactErr } = await supabase
      .from("contacts")
      .insert({
        company_id: companyId,
        name: row.contactName.trim(),
        designation: row.designation || null,
        phone: row.phone || null,
        email: row.email || null,
        industry: industry.value,
        city: row.city || null,
        lead_status: "New",
        is_primary: true,
      })
      .select("id")
      .single();
    if (contactErr || !contact) {
      summary.skipped.push({
        row: rowNum,
        reason: contactErr?.message ?? "Failed to create contact.",
      });
      continue;
    }
    summary.contactsCreated++;

    const { error: leadErr } = await supabase.from("leads").insert({
      company_id: companyId,
      contact_id: contact.id,
      designation: row.designation || null,
      industry: industry.value,
      phone: row.phone || null,
      email: row.email || null,
      website: row.website || null,
      city: row.city || null,
      state: row.state || null,
      status: "New",
      source: source.value,
      priority: priority.value,
      notes: row.notes || null,
      last_contact: today,
    });
    if (leadErr) {
      summary.skipped.push({ row: rowNum, reason: leadErr.message });
      continue;
    }
    summary.leadsCreated++;
  }

  revalidatePath("/leads");
  return summary;
}
