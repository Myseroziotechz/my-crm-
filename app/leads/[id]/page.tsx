import { notFound } from "next/navigation";
import { LeadDetailView } from "@/components/leads/LeadDetailView";
import {
  getActivityForLead,
  getAssignableEmployees,
  getCallsForLead,
  getFollowUpsForLead,
  getLeadById,
} from "@/lib/supabase/queries";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await getLeadById(id);
  if (!lead) notFound();

  const [calls, followUps, employees] = await Promise.all([
    getCallsForLead(lead.id),
    getFollowUpsForLead(lead.id),
    getAssignableEmployees(),
  ]);
  const events = getActivityForLead(lead, calls, followUps);

  return (
    <LeadDetailView
      lead={lead}
      events={events}
      calls={calls}
      followUps={followUps}
      employees={employees}
    />
  );
}
