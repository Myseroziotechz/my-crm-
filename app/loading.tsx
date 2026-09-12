import { Skeleton, CardsLoadingState } from "@/components/ui/LoadingState";

export default function Loading() {
  return (
    <div>
      <div className="mb-5">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-2 h-3 w-72" />
      </div>
      <CardsLoadingState count={8} />
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-ink-200 bg-white p-5 shadow-sm"
          >
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-4 h-40 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
