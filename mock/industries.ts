import type { Industry } from "@/lib/types";
import { INDUSTRIES } from "@/lib/constants";

export interface IndustryMeta {
  name: Industry;
  /** short description shown in settings */
  description: string;
  enabled: boolean;
}

export const industries: IndustryMeta[] = [
  {
    name: "Real Estate",
    description: "Developers, builders, brokerages and property management.",
    enabled: true,
  },
  {
    name: "Healthcare",
    description: "Hospitals, clinics, diagnostics and wellness providers.",
    enabled: true,
  },
  {
    name: "Education",
    description: "Schools, colleges, coaching centres and EdTech platforms.",
    enabled: true,
  },
  {
    name: "IT / Software",
    description: "Product companies, SaaS, IT services and consultancies.",
    enabled: true,
  },
  {
    name: "Hospitality",
    description: "Hotels, resorts, restaurants and event venues.",
    enabled: true,
  },
  {
    name: "Manufacturing",
    description: "Industrial equipment, components and process plants.",
    enabled: true,
  },
  {
    name: "Retail",
    description: "Chain stores, e-commerce and distribution.",
    enabled: true,
  },
  {
    name: "Finance",
    description: "Banks, NBFCs, advisory firms and insurance.",
    enabled: true,
  },
  {
    name: "Automotive",
    description: "Dealerships, workshops and auto component suppliers.",
    enabled: true,
  },
  {
    name: "Other",
    description: "Logistics, agriculture, media and everything else.",
    enabled: true,
  },
];

export { INDUSTRIES };
export type { Industry };
