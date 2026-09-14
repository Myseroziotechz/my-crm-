import { CompaniesClient } from "@/components/companies/CompaniesClient";
import { getCompanies } from "@/lib/supabase/queries";

export default async function CompaniesPage() {
  const companies = await getCompanies();
  return <CompaniesClient companies={companies} />;
}
