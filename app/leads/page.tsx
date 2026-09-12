import { LeadsClient } from "@/components/leads/LeadsClient";
import {
  getAssignableEmployees,
  getCompanyOptions,
  getLeads,
} from "@/lib/supabase/queries";

export default async function LeadsPage() {
  const [leads, companies, employees] = await Promise.all([
    getLeads(),
    getCompanyOptions(),
    getAssignableEmployees(),
  ]);

  return <LeadsClient leads={leads} companies={companies} employees={employees} />;
}
