import { FollowUpsClient } from "@/components/followups/FollowUpsClient";
import {
  getAssignableEmployees,
  getFollowUps,
  getLeadOptions,
} from "@/lib/supabase/queries";

export default async function FollowUpsPage() {
  const [followUps, employees, leadOptions] = await Promise.all([
    getFollowUps(),
    getAssignableEmployees(),
    getLeadOptions(),
  ]);

  return (
    <FollowUpsClient
      followUps={followUps}
      employees={employees}
      leadOptions={leadOptions}
    />
  );
}
