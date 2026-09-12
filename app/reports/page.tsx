"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { BarChart } from "@/components/charts/BarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { FunnelChart } from "@/components/charts/FunnelChart";
import { cn } from "@/lib/utils";
import { REPORT_DATE_RANGES } from "@/lib/constants";
import {
  leadsByIndustry,
  leadStatusDistribution,
  leadsByEmployee,
  callsByEmployee,
  conversionFunnel,
  interestedVsNot,
  leads,
} from "@/mock";

const won = leads.filter((l) => l.status === "Won").length;
const qualified = leads.filter((l) =>
  ["Qualified", "Proposal", "Negotiation"].includes(l.status),
).length;
const interested = leads.filter((l) => l.status === "Interested").length;
const notInterested = leads.filter(
  (l) => l.status === "Not Interested" || l.status === "Lost",
).length;
const conversion = Math.round((won / leads.length) * 1000) / 10;

const SUMMARY = [
  { label: "Interested Leads", value: interested },
  { label: "Qualified Leads", value: qualified },
  { label: "Not Interested", value: notInterested },
  { label: "Won Leads", value: won },
  { label: "Conversion Rate", value: `${conversion}%` },
];

export default function ReportsPage() {
  const [range, setRange] = useState("30d");
  const [custom, setCustom] = useState({ from: "", to: "" });

  return (
    <div>
      <PageHeader
        title="Reports"
        description="CRM analytics across leads, calls and team performance."
        actions={
          <Button variant="outline" icon={Download}>
            Export report
          </Button>
        }
      />

      {/* Date range selector */}
      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-ink-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-1.5">
          {REPORT_DATE_RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                range === r.value
                  ? "bg-brand-600 text-white"
                  : "text-ink-600 hover:bg-ink-100",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
        {range === "custom" && (
          <div className="flex items-center gap-2 sm:ml-auto">
            <input
              type="date"
              value={custom.from}
              onChange={(e) =>
                setCustom((c) => ({ ...c, from: e.target.value }))
              }
              className="h-9 rounded-lg border border-ink-300 px-2.5 text-sm"
            />
            <span className="text-ink-400">–</span>
            <input
              type="date"
              value={custom.to}
              onChange={(e) => setCustom((c) => ({ ...c, to: e.target.value }))}
              className="h-9 rounded-lg border border-ink-300 px-2.5 text-sm"
            />
          </div>
        )}
      </div>

      {/* Summary tiles */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {SUMMARY.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xl font-semibold text-ink-900">{s.value}</p>
            <p className="mt-1 text-xs text-ink-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Leads by Industry">
          <BarChart data={leadsByIndustry} orientation="horizontal" multicolor />
        </ChartCard>
        <ChartCard title="Leads by Status">
          <DonutChart data={leadStatusDistribution} centerLabel="Leads" />
        </ChartCard>
        <ChartCard title="Leads by Employee">
          <BarChart data={leadsByEmployee} orientation="horizontal" color="#2a78d6" />
        </ChartCard>
        <ChartCard title="Calls by Employee">
          <BarChart data={callsByEmployee} orientation="horizontal" color="#1baf7a" />
        </ChartCard>
        <ChartCard title="Conversion Funnel">
          <FunnelChart data={conversionFunnel} />
        </ChartCard>
        <ChartCard title="Interested vs Not Interested">
          <DonutChart
            data={[
              { label: "Interested", value: interestedVsNot[0].value, color: "#1baf7a" },
              { label: "Not Interested", value: interestedVsNot[1].value, color: "#e34948" },
              { label: "Undecided", value: interestedVsNot[2].value, color: "#94a3b8" },
            ]}
            centerLabel="Leads"
          />
        </ChartCard>
      </div>
    </div>
  );
}
