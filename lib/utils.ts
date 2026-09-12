/** Small presentation helpers shared across the app. */

/** Merge conditional class names. Lightweight clsx replacement. */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

/** "07 Sep 2026" */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** "07 Sep 2026, 10:30 AM" */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/** Relative time, e.g. "2h ago", "in 3d". */
export function relativeTime(iso: string): string {
  const now = new Date("2026-09-07T09:00:00").getTime();
  const then = new Date(iso).getTime();
  const diff = then - now;
  const abs = Math.abs(diff);
  const mins = Math.round(abs / 60000);
  const hours = Math.round(abs / 3600000);
  const days = Math.round(abs / 86400000);
  let out: string;
  if (mins < 60) out = `${mins}m`;
  else if (hours < 24) out = `${hours}h`;
  else out = `${days}d`;
  return diff < 0 ? `${out} ago` : `in ${out}`;
}

/** 4200 -> "₹4,200" */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** 4200 -> "₹4.2K", 4200000 -> "₹42L" (Indian compact) */
export function formatCompactCurrency(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
}

/** 145 -> "2m 25s" */
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return "0s";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

/** "Ramesh Kumar" -> "RK" */
export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export const TODAY_ISO = "2026-09-07";

/** "15:30:00" or "15:30" -> "03:30 PM" */
export function formatTime(time: string | null | undefined): string {
  if (!time) return "—";
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr, 10);
  if (Number.isNaN(h) || mStr === undefined) return time;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, "0")}:${mStr} ${period}`;
}

export function isToday(iso: string | null | undefined): boolean {
  return !!iso && iso.slice(0, 10) === TODAY_ISO;
}

export function isPast(iso: string | null | undefined): boolean {
  return !!iso && iso.slice(0, 10) < TODAY_ISO;
}

export function isFuture(iso: string | null | undefined): boolean {
  return !!iso && iso.slice(0, 10) > TODAY_ISO;
}

/** Deterministic pseudo-random for stable mock data generation. */
export function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}
