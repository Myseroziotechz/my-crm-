import { Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 text-ink-400">
        <Compass className="h-7 w-7" />
      </div>
      <h1 className="mt-5 text-lg font-semibold text-ink-900">
        Record not found
      </h1>
      <p className="mt-1 max-w-sm text-sm text-ink-500">
        The page or record you&apos;re looking for doesn&apos;t exist in the mock
        dataset.
      </p>
      <div className="mt-6 flex gap-3">
        <Button href="/" variant="outline">
          Go to dashboard
        </Button>
        <Button href="/leads">View leads</Button>
      </div>
    </div>
  );
}
