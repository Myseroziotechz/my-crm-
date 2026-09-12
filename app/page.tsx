import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { TodaysFollowUps } from "@/components/dashboard/TodaysFollowUps";
import { BarChart } from "@/components/charts/BarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { LineChart } from "@/components/charts/LineChart";
import { FunnelChart } from "@/components/charts/FunnelChart";
import { Button } from "@/components/ui/Button";
import { Download, Plus } from "lucide-react";
import { getDashboardData } from "@/lib/supabase/queries";
import { formatDate } from "@/lib/utils";

/** Where each KPI card links to — pre-filters the Leads list to match what the number represents. */
const KPI_HREF: Record<string, string> = {
  total: "/leads",
  new: "/leads?status=New",
  interested: "/leads?status=Interested",
  followups: "/followups",
  qualified: "/leads?status=Qualified",
  won: "/leads?status=Won",
  notInterested: "/leads?status=Not+Interested",
  conversion: "/leads?status=Won",
};

export default async function DashboardPage() {
  const {
    kpis,
    leadsByIndustry,
    leadStatusDistribution,
    callsPerDay,
    interestedVsNot,
    conversionFunnel,
    employeePerformance,
    todaysFollowUps,
  } = await getDashboardData();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Lead aggregation overview across all industries — data as of ${formatDate(new Date().toISOString())}.`}
        actions={
          <>
            <Button variant="outline" icon={Download} size="md">
              Export
            </Button>
            <Button href="/leads/new" icon={Plus} size="md">
              Add Lead
            </Button>
          </>
        }
      />

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard
            key={kpi.key}
            label={kpi.label}
            value={kpi.value}
            delta={kpi.delta}
            trend={kpi.trend}
            positiveIsGood={kpi.key !== "notInterested"}
            href={KPI_HREF[kpi.key]}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Leads by Industry"
          subtitle="Distribution of active leads across verticals"
        >
          <BarChart
            data={leadsByIndustry}
            orientation="horizontal"
            multicolor
          />
        </ChartCard>

        <ChartCard
          title="Lead Status Distribution"
          subtitle="Where leads currently sit in the pipeline"
        >
          <DonutChart data={leadStatusDistribution} centerLabel="Leads" />
        </ChartCard>

        <ChartCard
          title="Calls Per Day"
          subtitle="Outbound call volume, last 14 days"
        >
          <LineChart data={callsPerDay} />
        </ChartCard>

        <ChartCard
          title="Interested vs Not Interested"
          subtitle="Sentiment split of the current lead base"
        >
          <DonutChart
            data={[
              { label: "Interested", value: interestedVsNot[0].value, color: "#1baf7a" },
              { label: "Not Interested", value: interestedVsNot[1].value, color: "#e34948" },
              { label: "Undecided", value: interestedVsNot[2].value, color: "#94a3b8" },
            ]}
            centerLabel="Leads"
          />
        </ChartCard>

        <ChartCard
          title="Lead Conversion Funnel"
          subtitle="Stage-to-stage progression"
        >
          <FunnelChart data={conversionFunnel} />
        </ChartCard>

        <ChartCard
          title="Employee Performance"
          subtitle="Blended score — wins, qualified leads and call activity"
        >
          <BarChart
            data={employeePerformance}
            orientation="horizontal"
            color="#2a78d6"
          />
        </ChartCard>
      </div>

      {/* Today's follow-ups */}
      <div className="mt-5">
        <TodaysFollowUps items={todaysFollowUps} />
      </div>
    </div>
  );
}
