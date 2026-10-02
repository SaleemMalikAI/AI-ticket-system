"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { ALL_LABEL, CATEGORIES, PRIORITIES, SEARCH_MAX_LENGTH, STATUSES } from "@/constants/ticket";
import { SEARCH_DEBOUNCE_MS } from "@/constants/ui";
import type { TicketFilters as Filters } from "@/types/ticket";

interface Props {
  filters: Filters;
  activeCount: number;
  onChange: (key: keyof Filters, value: string) => void;
  onClear: () => void;
}

export function TicketFilters({ filters, activeCount, onChange, onClear }: Props) {
  const urlSearch = filters.q ?? "";
  const [search, setSearch] = useState(urlSearch);

  // Follow the URL when it changes elsewhere (Clear button, back/forward, links)
  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  // Push typing into the URL once the user pauses
  useEffect(() => {
    const value = search.trim();
    if (value === urlSearch) return;
    const timer = setTimeout(() => onChange("q", value), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search, urlSearch, onChange]);

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

      <div className="relative mb-4">
        <label htmlFor="f-search" className="sr-only">
          Search tickets
        </label>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
        <input
          id="f-search"
          type="search"
          className="input h-11 pl-9"
          placeholder="Search title, description or AI summary…"
          value={search}
          maxLength={SEARCH_MAX_LENGTH}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Select id="f-status" labelText="Status" value={filters.status ?? ""} options={STATUSES} emptyLabel={ALL_LABEL} onChange={(v) => onChange("status", v)} />
        <Select id="f-category" labelText="Category" value={filters.category ?? ""} options={CATEGORIES} emptyLabel={ALL_LABEL} onChange={(v) => onChange("category", v)} />
        <Select id="f-priority" labelText="Priority" value={filters.priority ?? ""} options={PRIORITIES} emptyLabel={ALL_LABEL} onChange={(v) => onChange("priority", v)} />
      </div>
    </section>
  );
}
