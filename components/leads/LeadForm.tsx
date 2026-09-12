"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Building2, UserRound, Target } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField, TextInput, Select, Textarea } from "@/components/ui/FormField";
import {
  INDUSTRIES,
  LEAD_SOURCES,
  PRIORITIES,
  CITIES,
  STATES,
} from "@/lib/constants";
import { createLead } from "@/app/leads/actions";
import type { EmployeeOption } from "@/lib/supabase/queries";

type Errors = Record<string, string>;

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^[\d+][\d\s-]{7,}$/;

interface Props {
  employees: EmployeeOption[];
}

export function LeadForm({ employees }: Props) {
  const router = useRouter();
  const [values, setValues] = useState({
    companyName: "",
    industry: "",
    website: "",
    companyPhone: "",
    city: "",
    state: "",
    contactName: "",
    designation: "",
    phone: "",
    email: "",
    source: "",
    priority: "Medium",
    assigneeId: employees[0]?.id ?? "",
    notes: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const set = (k: string, v: string) => {
    setValues((s) => ({ ...s, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = (): boolean => {
    const e: Errors = {};
    if (!values.companyName.trim()) e.companyName = "Company name is required.";
    if (!values.industry) e.industry = "Select an industry.";
    if (values.website && !/\./.test(values.website))
      e.website = "Enter a valid website.";
    if (!values.city) e.city = "Select a city.";
    if (!values.contactName.trim()) e.contactName = "Contact name is required.";
    if (!values.phone.trim()) e.phone = "Phone is required.";
    else if (!phoneRe.test(values.phone.trim()))
      e.phone = "Enter a valid phone number.";
    if (values.email && !emailRe.test(values.email))
      e.email = "Enter a valid email address.";
    if (!values.source) e.source = "Select a lead source.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError("");
    const result = await createLead(values);
    setSubmitting(false);
    if ("error" in result) {
      setSubmitError(result.error);
      return;
    }
    setSaved(true);
    setTimeout(() => router.push("/leads"), 1200);
  };

  if (saved) {
    return (
      <Card>
        <CardBody className="flex flex-col items-center py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Check className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-ink-900">
            Lead created
          </h3>
          <p className="mt-1 text-sm text-ink-500">
            Redirecting you back to the leads list…
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Card>
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-ink-400" /> Company Information
            </span>
          }
        />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Company Name"
            required
            error={errors.companyName}
            className="sm:col-span-2"
          >
            <TextInput
              value={values.companyName}
              onChange={(e) => set("companyName", e.target.value)}
              invalid={!!errors.companyName}
              placeholder="e.g. ABC Hospital"
            />
          </FormField>
          <FormField label="Industry" required error={errors.industry}>
            <Select
              value={values.industry}
              onChange={(e) => set("industry", e.target.value)}
              invalid={!!errors.industry}
            >
              <option value="">Select industry</option>
              {INDUSTRIES.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Website" error={errors.website}>
            <TextInput
              value={values.website}
              onChange={(e) => set("website", e.target.value)}
              invalid={!!errors.website}
              placeholder="www.example.com"
            />
          </FormField>
          <FormField label="Company Phone">
            <TextInput
              value={values.companyPhone}
              onChange={(e) => set("companyPhone", e.target.value)}
              placeholder="+91 80 4123 5500"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="City" required error={errors.city}>
              <Select
                value={values.city}
                onChange={(e) => set("city", e.target.value)}
                invalid={!!errors.city}
              >
                <option value="">Select</option>
                {CITIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="State">
              <Select
                value={values.state}
                onChange={(e) => set("state", e.target.value)}
              >
                <option value="">Select</option>
                {STATES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </FormField>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-ink-400" /> Contact Information
            </span>
          }
        />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Contact Name" required error={errors.contactName}>
            <TextInput
              value={values.contactName}
              onChange={(e) => set("contactName", e.target.value)}
              invalid={!!errors.contactName}
              placeholder="e.g. Ramesh Kumar"
            />
          </FormField>
          <FormField label="Designation">
            <TextInput
              value={values.designation}
              onChange={(e) => set("designation", e.target.value)}
              placeholder="e.g. Procurement Head"
            />
          </FormField>
          <FormField label="Phone" required error={errors.phone}>
            <TextInput
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
              invalid={!!errors.phone}
              placeholder="+91 98xxxxxxxx"
            />
          </FormField>
          <FormField label="Email" error={errors.email}>
            <TextInput
              type="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              invalid={!!errors.email}
              placeholder="name@company.com"
            />
          </FormField>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <Target className="h-4 w-4 text-ink-400" /> Lead Information
            </span>
          }
        />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Lead Source" required error={errors.source}>
            <Select
              value={values.source}
              onChange={(e) => set("source", e.target.value)}
              invalid={!!errors.source}
            >
              <option value="">Select source</option>
              {LEAD_SOURCES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Priority">
            <Select
              value={values.priority}
              onChange={(e) => set("priority", e.target.value)}
            >
              {PRIORITIES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Assigned Employee">
            <Select
              value={values.assigneeId}
              onChange={(e) => set("assigneeId", e.target.value)}
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Notes" className="sm:col-span-2">
            <Textarea
              value={values.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Requirement summary, budget cycle, competitors in the deal…"
            />
          </FormField>
        </CardBody>
      </Card>

      {submitError && <p className="text-sm text-rose-600">{submitError}</p>}

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" type="button" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" icon={Check} disabled={submitting}>
          {submitting ? "Creating…" : "Create Lead"}
        </Button>
      </div>
    </form>
  );
}
