import type { Contact, LeadStatus } from "@/lib/types";
import { seededRandom, pick } from "@/lib/utils";
import { companies } from "./companies";

const FIRST_NAMES = [
  "Ramesh",
  "Anita",
  "Suresh",
  "Kavita",
  "Deepak",
  "Neha",
  "Manoj",
  "Pooja",
  "Rajesh",
  "Divya",
  "Sanjay",
  "Ritu",
  "Anil",
  "Shalini",
  "Vinod",
  "Preeti",
  "Karthik",
  "Lakshmi",
  "Gopal",
  "Sunita",
];

const LAST_NAMES = [
  "Kumar",
  "Iyer",
  "Nair",
  "Rao",
  "Verma",
  "Patel",
  "Desai",
  "Joshi",
  "Pillai",
  "Bhat",
  "Chopra",
  "Malhotra",
  "Shetty",
  "Kulkarni",
  "Banerjee",
];

const DESIGNATIONS = [
  "Managing Director",
  "Chief Executive Officer",
  "Procurement Head",
  "Operations Manager",
  "General Manager",
  "Purchase Manager",
  "IT Head",
  "Facilities Manager",
  "Marketing Director",
  "Finance Controller",
  "Administrator",
  "Branch Manager",
];

const LEAD_STATUS_POOL: LeadStatus[] = [
  "New",
  "Contacted",
  "Interested",
  "Follow-up",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
  "Not Interested",
];

const rand = seededRandom(4021);

export const contacts: Contact[] = [];

let counter = 1;
for (const company of companies) {
  const count = 1 + Math.floor(rand() * 3); // 1 - 3 contacts
  for (let i = 0; i < count; i++) {
    const first = pick(FIRST_NAMES, rand);
    const last = pick(LAST_NAMES, rand);
    const name = `${first} ${last}`;
    const slug = `${first}.${last}`.toLowerCase();
    const domain = company.website.replace(/^www\./, "");
    const id = `CON-${String(counter).padStart(3, "0")}`;
    contacts.push({
      id,
      name,
      companyId: company.id,
      companyName: company.name,
      designation: pick(DESIGNATIONS, rand),
      phone: `+91 9${Math.floor(rand() * 900000000 + 100000000)}`,
      email: `${slug}@${domain}`,
      industry: company.industry,
      city: company.city,
      leadStatus: pick(LEAD_STATUS_POOL, rand),
      isPrimary: i === 0,
      createdDate: company.createdDate,
    });
    counter++;
  }
}

export function contactsByCompany(companyId: string): Contact[] {
  return contacts.filter((c) => c.companyId === companyId);
}
