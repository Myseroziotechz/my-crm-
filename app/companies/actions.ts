"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface CreateCompanyInput {
  name: string;
  industry: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

export type CreateCompanyResult = { id: string } | { error: string };

export async function createCompany(
  input: CreateCompanyInput,
): Promise<CreateCompanyResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("companies")
    .insert({
      name: input.name,
      industry: input.industry,
      website: input.website || null,
      phone: input.phone || null,
      email: input.email || null,
      address: input.address || null,
      city: input.city || null,
      state: input.state || null,
      country: input.country || null,
      status: "Prospect",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Failed to create company." };
  }

  revalidatePath("/companies");
  return { id: data.id };
}
