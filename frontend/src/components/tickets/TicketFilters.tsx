import { SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { ALL_LABEL, CATEGORIES, PRIORITIES, STATUSES } from "@/constants/ticket";
import type { TicketFilters as Filters } from "@/types/ticket";

interface Props {
  filters: Filters;
  activeCount: number;
  onChange: (key: keyof Filters, value: string) => void;
  onClear: () => void;
}

export function TicketFilters({ filters, activeCount, onChange, onClear }: Props) {
  return (
    <section aria-label="Filters" className="card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-sm font-semibold">
          <SlidersHorizontal className="size-4 text-muted" aria-hidden />
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground tabular-nums">
              {activeCount}
            </span>
          )}
        </h2>
        <Button variant="ghost" size="sm" icon={<X />} onClick={onClear} disabled={activeCount === 0}>
          Clear
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Select id="f-status" labelText="Status" value={filters.status ?? ""} options={STATUSES} emptyLabel={ALL_LABEL} onChange={(v) => onChange("status", v)} />
        <Select id="f-category" labelText="Category" value={filters.category ?? ""} options={CATEGORIES} emptyLabel={ALL_LABEL} onChange={(v) => onChange("category", v)} />
        <Select id="f-priority" labelText="Priority" value={filters.priority ?? ""} options={PRIORITIES} emptyLabel={ALL_LABEL} onChange={(v) => onChange("priority", v)} />
      </div>
    </section>
  );
}
