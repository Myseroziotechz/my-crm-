import { PageHeader } from "@/components/layout/PageHeader";
import { LeadForm } from "@/components/leads/LeadForm";
import { getAssignableEmployees } from "@/lib/supabase/queries";

export default async function NewLeadPage() {
  const employees = await getAssignableEmployees();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Add Lead"
        description="Capture a new business lead. Fields marked * are required."
        breadcrumbs={[{ label: "Leads", href: "/leads" }, { label: "Add Lead" }]}
      />
      <LeadForm employees={employees} />
    </div>
  );
}
