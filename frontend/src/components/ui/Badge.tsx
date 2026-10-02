import { label } from "@/utilities/format";

const COLORS: Record<string, string> = {
  // priority
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
  // status
  open: "bg-emerald-100 text-emerald-800",
  in_progress: "bg-amber-100 text-amber-800",
  resolved: "bg-sky-100 text-sky-800",
  closed: "bg-slate-200 text-slate-700",
};

export function Badge({ value }: { value: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
        COLORS[value] ?? "bg-violet-100 text-violet-800"
      }`}
    >
      {label(value)}
    </span>
  );
}
