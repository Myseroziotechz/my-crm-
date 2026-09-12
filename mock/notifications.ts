import type { Notification } from "@/lib/types";

export const notifications: Notification[] = [
  {
    id: "NOT-01",
    title: "Follow-up due now",
    description: "ABC Hospital — Ramesh Kumar at 10:30 AM",
    time: "2026-09-07T09:00:00",
    read: false,
    type: "followup",
  },
  {
    id: "NOT-02",
    title: "Lead marked Interested",
    description: "Nexworks Technologies moved to Interested by Arjun Menon",
    time: "2026-09-07T08:20:00",
    read: false,
    type: "lead",
  },
  {
    id: "NOT-03",
    title: "Call logged",
    description: "Sneha Reddy logged a 6m call with Skyline Estates",
    time: "2026-09-06T17:45:00",
    read: false,
    type: "call",
  },
  {
    id: "NOT-04",
    title: "New lead assigned",
    description: "LEAD-1032 (Quantum Analytics) assigned to you",
    time: "2026-09-06T14:10:00",
    read: true,
    type: "lead",
  },
  {
    id: "NOT-05",
    title: "Deal won",
    description: "Meridian Capital Advisors marked Won — ₹8.4L",
    time: "2026-09-05T11:30:00",
    read: true,
    type: "lead",
  },
  {
    id: "NOT-06",
    title: "Weekly report ready",
    description: "Your team performance summary for last week is available",
    time: "2026-09-05T09:00:00",
    read: true,
    type: "system",
  },
];

export const currentUser = {
  id: "EMP-01",
  name: "Ravi Kumar",
  email: "ravi.kumar@mytechz.com",
  role: "Admin" as const,
  avatarColor: "#2563eb",
};
