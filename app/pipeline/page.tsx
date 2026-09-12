import { Info } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";
import { leads } from "@/mock";

export default function PipelinePage() {
  return (
    <div>
      <PageHeader
        title="Pipeline"
        description="Drag leads between stages to update the sales pipeline."
        actions={
          <Button href="/leads/new" size="md">
            Add Lead
          </Button>
        }
      />

      <div className="mb-4 flex items-start gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-xs text-brand-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        Drag-and-drop is fully interactive in this preview but changes are held
        in local state only — no backend persistence yet.
      </div>

      <PipelineBoard initialLeads={leads} />
    </div>
  );
}
