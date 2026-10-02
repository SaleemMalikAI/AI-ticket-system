import { Filter } from "lucide-react";

import type { QueryPlan } from "@/types/assistant";
import { planChips } from "@/utilities/assistant";

export function PlanChips({ plan }: { plan: QueryPlan }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted">
        <Filter className="size-3.5" aria-hidden />
        Filters used
      </span>
      {planChips(plan).map((chip) => (
        <span
          key={chip.name}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-muted/70 px-2 py-0.5 text-xs"
        >
          <span className="text-muted">{chip.name}:</span>
          <span className="font-medium">{chip.value}</span>
        </span>
      ))}
    </div>
  );
}
