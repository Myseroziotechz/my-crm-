import { notFound } from "next/navigation";
import { CompanyDetailView } from "@/components/companies/CompanyDetailView";
import {
  getActivityForLead,
  getCallsForLeadIds,
  getCompanyById,
  getContactsForCompany,
  getFollowUpsForLeadIds,
  getLeadsForCompany,
} from "@/lib/supabase/queries";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await getCompanyById(id);
  if (!company) notFound();

  const [contacts, leads] = await Promise.all([
    getContactsForCompany(company.id),
    getLeadsForCompany(company.id),
  ]);

  const leadIds = leads.map((l) => l.id);
  const [calls, followUps] = await Promise.all([
    getCallsForLeadIds(leadIds),
    getFollowUpsForLeadIds(leadIds),
  ]);

  const activities = leads
    .flatMap((lead) =>
      getActivityForLead(
        lead,
        calls.filter((c) => c.leadId === lead.id),
        followUps.filter((f) => f.leadId === lead.id),
      ),
    )
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 20);

  return (
    <CompanyDetailView
      company={company}
      contacts={contacts}
      leads={leads}
      calls={calls}
      activities={activities}
    />
  );
}
