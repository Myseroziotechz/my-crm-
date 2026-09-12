/**
 * Central TypeScript domain model for MyTechz CRM.
 * These types are shared across mock data, components and pages.
 */

export type Industry =
  | "Real Estate"
  | "Healthcare"
  | "Education"
  | "IT / Software"
  | "Hospitality"
  | "Manufacturing"
  | "Retail"
  | "Finance"
  | "Automotive"
  | "Other";

export type LeadStatus =
  | "New"
  | "Contacted"
  | "Interested"
  | "Follow-up"
  | "Qualified"
  | "Proposal"
  | "Negotiation"
  | "Won"
  | "Lost"
  | "Not Interested";

export type InterestLevel = "High" | "Medium" | "Low" | "Not Interested";

export type CallStatus =
  | "Answered"
  | "No Answer"
  | "Busy"
  | "Call Back"
  | "Wrong Number";

export type FollowUpStatus = "Pending" | "Completed" | "Missed" | "Cancelled";

export type UserRole = "Admin" | "Manager" | "Sales" | "Marketing" | "Viewer";

export type LeadSource =
  | "Website"
  | "Referral"
  | "Cold Call"
  | "Email Campaign"
  | "Trade Show"
  | "Social Media"
  | "Partner"
  | "Advertisement";

export type Priority = "Low" | "Medium" | "High";

export type CompanyStatus = "Active" | "Inactive" | "Prospect";

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarColor: string;
  joinedDate: string;
  active: boolean;
  stats: {
    leadsAssigned: number;
    calls: number;
    interested: number;
    qualified: number;
    won: number;
    /** 0 - 100 performance score */
    performance: number;
  };
}

export interface Company {
  id: string;
  name: string;
  industry: Industry;
  website: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  status: CompanyStatus;
  contactCount: number;
  leadCount: number;
  lastContact: string;
  createdDate: string;
}

export interface Contact {
  id: string;
  name: string;
  companyId: string;
  companyName: string;
  designation: string;
  phone: string;
  email: string;
  industry: Industry;
  city: string;
  leadStatus: LeadStatus;
  isPrimary: boolean;
  createdDate: string;
}

export interface Lead {
  id: string;
  companyId: string;
  companyName: string;
  contactId: string;
  contactName: string;
  designation: string;
  industry: Industry;
  phone: string;
  email: string;
  website: string;
  city: string;
  state: string;
  status: LeadStatus;
  interest: InterestLevel;
  source: LeadSource;
  priority: Priority;
  assignedTo: string;
  assignedToId: string;
  value: number;
  createdDate: string;
  lastContact: string;
  nextFollowUp: string | null;
  notes: string;
}

export interface Call {
  id: string;
  leadId: string;
  companyId: string;
  companyName: string;
  contactId: string;
  contactName: string;
  employeeId: string;
  employeeName: string;
  date: string;
  status: CallStatus;
  interest: InterestLevel | null;
  /** duration in seconds */
  duration: number;
  remarks: string;
}

export interface FollowUp {
  id: string;
  leadId: string;
  companyId: string;
  companyName: string;
  contactId: string;
  contactName: string;
  employeeId: string;
  employeeName: string;
  date: string;
  time: string;
  reason: string;
  status: FollowUpStatus;
  notes: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "lead" | "call" | "followup" | "system";
}

export interface KpiStat {
  label: string;
  value: string;
  delta: number;
  deltaLabel: string;
  trend: "up" | "down" | "neutral";
}

/** Generic option used by selects and filter panels */
export interface SelectOption<T extends string = string> {
  label: string;
  value: T;
}

/** Column definition for the reusable DataTable */
export interface Column<Row> {
  key: string;
  header: string;
  /** Render the cell. Falls back to Row[key] as string when omitted. */
  render?: (row: Row) => React.ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
  /** Hide this column on small screens in the table view */
  hideOnMobile?: boolean;
}
