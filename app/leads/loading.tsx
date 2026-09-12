import { Skeleton } from "@/components/ui/LoadingState";
import { TableLoadingState } from "@/components/ui/LoadingState";
import { Card } from "@/components/ui/Card";

export default function Loading() {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="mt-2 h-3 w-64" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <Skeleton className="h-9 w-full max-w-md" />
      <Skeleton className="mt-4 h-28 w-full" />
      <Card className="mt-4 overflow-hidden">
        <TableLoadingState rows={8} />
      </Card>
    </div>
  );
}
