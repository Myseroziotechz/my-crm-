import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  delta: number;
  trend: "up" | "down" | "neutral";
  /** whether an upward trend is good (default true) */
  positiveIsGood?: boolean;
  /** when set, the whole card becomes a link (e.g. to the filtered Leads list) */
  href?: string;
}

export function KpiCard({
  label,
  value,
  delta,
  trend,
  positiveIsGood = true,
  href,
}: Props) {
  const good =
    trend === "neutral"
      ? null
      : positiveIsGood
        ? trend === "up"
        : trend === "down";

  const Icon =
    trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;

  const content = (
    <>
      <p className="text-xs font-medium text-ink-500">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <span className="text-2xl font-semibold tracking-tight text-ink-900">
          {value}
        </span>
        {trend !== "neutral" && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium",
              good
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700",
            )}
          >
            <Icon className="h-3 w-3" />
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <p className="mt-1 text-[11px] text-ink-400">vs. last 30 days</p>
    </>
  );

  const className = cn(
    "block rounded-xl border border-ink-200 bg-white p-4 shadow-sm",
    href && "transition-colors hover:border-brand-300 hover:shadow-md",
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
