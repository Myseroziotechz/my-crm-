"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface CreateFollowUpInput {
  leadId: string;
  employeeId: string;
  date: string;
  time: string;
  reason: string;
  notes: string;
}

export type CreateFollowUpResult = { id: string } | { error: string };

export async function createFollowUp(
  input: CreateFollowUpInput,
): Promise<CreateFollowUpResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("follow_ups")
    .insert({
      lead_id: input.leadId,
      employee_id: input.employeeId || null,
      date: input.date,
      time: input.time,
      reason: input.reason || null,
      status: "Pending",
      notes: input.notes || null,
    })
    .select("id")
    .single();
  if (error || !data) {
    return { error: error?.message ?? "Failed to schedule follow-up." };
  }

  await supabase
    .from("leads")
    .update({ next_follow_up: input.date })
    .eq("id", input.leadId);

  revalidatePath("/followups");
  revalidatePath("/leads");
  revalidatePath(`/leads/${input.leadId}`);
  return { id: data.id };
}

export type CompleteFollowUpResult = { ok: true } | { error: string };

export async function completeFollowUp(
  id: string,
  leadId: string,
): Promise<CompleteFollowUpResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("follow_ups")
    .update({ status: "Completed" })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/followups");
  revalidatePath(`/leads/${leadId}`);
  return { ok: true };
}
