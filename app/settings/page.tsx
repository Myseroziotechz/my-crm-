"use client";

import { useState } from "react";
import {
  Building,
  ListChecks,
  Factory,
  Radio,
  PhoneCall,
  SlidersHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField, TextInput, Select } from "@/components/ui/FormField";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import {
  LEAD_STATUSES,
  CALL_STATUSES,
  LEAD_SOURCES,
} from "@/lib/constants";
import { industries } from "@/mock";

const SECTIONS = [
  { key: "company", label: "Company Settings", icon: Building },
  { key: "status", label: "Lead Status", icon: ListChecks },
  { key: "industries", label: "Industries", icon: Factory },
  { key: "sources", label: "Lead Sources", icon: Radio },
  { key: "calls", label: "Call Status", icon: PhoneCall },
  { key: "prefs", label: "User Preferences", icon: SlidersHorizontal },
];

function EditableList({
  title,
  items,
  badgeKind,
}: {
  title: string;
  items: string[];
  badgeKind?: "lead" | "call";
}) {
  return (
    <Card>
      <CardHeader
        title={title}
        action={
          <Button size="sm" variant="outline" icon={Plus}>
            Add
          </Button>
        }
      />
      <CardBody className="space-y-2">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2"
          >
            <div className="flex items-center gap-2.5">
              {badgeKind ? (
                <StatusBadge
                  kind={badgeKind}
                  value={item as never}
                  size="sm"
                />
              ) : (
                <span className="text-sm text-ink-700">{item}</span>
              )}
            </div>
            <button className="rounded-md p-1.5 text-ink-300 hover:bg-rose-50 hover:text-rose-500">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

export default function SettingsPage() {
  const [section, setSection] = useState("company");

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Configure the CRM. Values are mock data in this preview."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                section === s.key
                  ? "bg-brand-50 text-brand-700"
                  : "text-ink-600 hover:bg-ink-100",
              )}
            >
              <s.icon className="h-4 w-4" />
              {s.label}
            </button>
          ))}
        </nav>

        <div className="space-y-4">
          {section === "company" && (
            <Card>
              <CardHeader title="Company Settings" />
              <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Organisation Name">
                  <TextInput defaultValue="MyTechz Lead Solutions" />
                </FormField>
                <FormField label="Support Email">
                  <TextInput defaultValue="support@mytechz.com" />
                </FormField>
                <FormField label="Phone">
                  <TextInput defaultValue="+91 80 4123 5500" />
                </FormField>
                <FormField label="Default Currency">
                  <Select defaultValue="INR">
                    <option>INR</option>
                    <option>USD</option>
                    <option>AED</option>
                  </Select>
                </FormField>
                <FormField label="Timezone">
                  <Select defaultValue="IST">
                    <option>IST (UTC+5:30)</option>
                    <option>GST (UTC+4)</option>
                    <option>UTC</option>
                  </Select>
                </FormField>
                <FormField label="Fiscal Year Start">
                  <Select defaultValue="April">
                    <option>January</option>
                    <option>April</option>
                  </Select>
                </FormField>
                <div className="sm:col-span-2">
                  <Button>Save changes</Button>
                </div>
              </CardBody>
            </Card>
          )}

          {section === "status" && (
            <EditableList
              title="Lead Status"
              items={[...LEAD_STATUSES]}
              badgeKind="lead"
            />
          )}

          {section === "industries" && (
            <Card>
              <CardHeader
                title="Industries"
                action={
                  <Button size="sm" variant="outline" icon={Plus}>
                    Add
                  </Button>
                }
              />
              <CardBody className="space-y-2">
                {industries.map((i) => (
                  <div
                    key={i.name}
                    className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink-800">
                        {i.name}
                      </p>
                      <p className="text-xs text-ink-400">{i.description}</p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-medium",
                        i.enabled
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-ink-100 text-ink-500",
                      )}
                    >
                      {i.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          {section === "sources" && (
            <EditableList title="Lead Sources" items={[...LEAD_SOURCES]} />
          )}

          {section === "calls" && (
            <EditableList
              title="Call Status"
              items={[...CALL_STATUSES]}
              badgeKind="call"
            />
          )}

          {section === "prefs" && (
            <Card>
              <CardHeader title="User Preferences" />
              <CardBody className="space-y-4">
                {[
                  ["Email notifications", "New lead assignments and mentions"],
                  ["Follow-up reminders", "Push reminder 30 min before a follow-up"],
                  ["Weekly performance digest", "Sent every Monday at 9:00 AM"],
                  ["Compact table density", "Show more rows per screen"],
                ].map(([label, desc], i) => (
                  <label
                    key={label}
                    className="flex items-center justify-between gap-4"
                  >
                    <span>
                      <span className="block text-sm font-medium text-ink-800">
                        {label}
                      </span>
                      <span className="block text-xs text-ink-400">{desc}</span>
                    </span>
                    <input
                      type="checkbox"
                      defaultChecked={i < 2}
                      className="h-4 w-8 cursor-pointer appearance-none rounded-full bg-ink-200 transition-colors checked:bg-brand-600"
                    />
                  </label>
                ))}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
