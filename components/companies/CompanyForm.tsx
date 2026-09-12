"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField, TextInput, Select, Textarea } from "@/components/ui/FormField";
import { INDUSTRIES, CITIES, STATES } from "@/lib/constants";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CompanyForm({ onDone }: { onDone?: () => void }) {
  const router = useRouter();
  const [values, setValues] = useState({
    name: "",
    industry: "",
    website: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    country: "India",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const set = (k: string, v: string) => {
    setValues((s) => ({ ...s, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!values.name.trim()) e.name = "Company name is required.";
    if (!values.industry) e.industry = "Select an industry.";
    if (values.email && !emailRe.test(values.email))
      e.email = "Enter a valid email.";
    if (!values.city) e.city = "Select a city.";
    if (values.website && !/\./.test(values.website))
      e.website = "Enter a valid website.";
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaved(true);
    setTimeout(() => {
      if (onDone) onDone();
      else router.push("/companies");
    }, 1100);
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Check className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-ink-900">
          Company created
        </h3>
        <p className="mt-1 text-sm text-ink-500">Saved to the mock dataset.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Card>
        <CardHeader title="Company Details" />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Company Name"
            required
            error={errors.name}
            className="sm:col-span-2"
          >
            <TextInput
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              invalid={!!errors.name}
              placeholder="e.g. Sunrise Developers"
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
          <FormField label="Phone">
            <TextInput
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+91 22 6789 0000"
            />
          </FormField>
          <FormField label="Email" error={errors.email}>
            <TextInput
              type="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              invalid={!!errors.email}
              placeholder="info@company.com"
            />
          </FormField>
          <FormField
            label="Address"
            className="sm:col-span-2"
          >
            <Textarea
              value={values.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Street, area, landmark"
              className="min-h-[64px]"
            />
          </FormField>
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
          <FormField label="Country">
            <TextInput
              value={values.country}
              onChange={(e) => set("country", e.target.value)}
            />
          </FormField>
        </CardBody>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          type="button"
          onClick={() => {
            if (onDone) onDone();
            else router.back();
          }}
        >
          Cancel
        </Button>
        <Button type="submit" icon={Check}>
          Create Company
        </Button>
      </div>
    </form>
  );
}
