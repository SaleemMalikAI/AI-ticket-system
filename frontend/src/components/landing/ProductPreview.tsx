import { Sparkles } from "lucide-react";

import { CategoryBadge, PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { SAMPLE_TICKET as T } from "@/constants/landing";

/** Static mock of a triaged ticket for the hero (illustration, not live data). */
export function ProductPreview() {
  return (
    <figure className="relative mx-auto w-full max-w-lg">
      {/* glow */}
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-tr from-indigo-500/25 via-violet-500/20 to-sky-400/20 blur-2xl"
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-indigo-950/10">
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-border bg-surface-muted/70 px-4 py-3">
          <span className="size-2.5 rounded-full bg-red-400" aria-hidden />
          <span className="size-2.5 rounded-full bg-amber-400" aria-hidden />
          <span className="size-2.5 rounded-full bg-emerald-400" aria-hidden />
          <span className="ml-3 text-xs font-medium text-muted">Ticket #{T.id}</span>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <div>
            <p className="text-lg font-semibold">{T.title}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <StatusBadge value="open" />
              <PriorityBadge value={T.priority} />
              <CategoryBadge value={T.category} />
            </div>
          </div>

          <p className="text-sm leading-relaxed text-muted">{T.description}</p>

          <div className="rounded-xl bg-gradient-to-br from-violet-400/60 via-indigo-400/40 to-sky-400/40 p-px">
            <div className="rounded-[calc(0.75rem-1px)] bg-surface p-4">
              <p className="flex items-center gap-2 text-xs font-semibold">
                <span className="grid size-6 place-items-center rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
                  <Sparkles className="size-3.5" aria-hidden />
                </span>
                AI analysis
              </p>
              <p className="mt-2 text-sm leading-relaxed">{T.ai_summary}</p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border pt-3 text-xs text-muted">
                Suggested:
                <CategoryBadge value={T.category} />
                <PriorityBadge value={T.priority} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* floating chip */}
      <div className="absolute -bottom-5 -left-3 hidden items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium shadow-lg sm:flex">
        <span className="size-2 animate-pulse rounded-full bg-emerald-500" aria-hidden />
        Suggestions stay editable
      </div>

      <figcaption className="sr-only">
        Example: a ticket titled “{T.title}” with an AI summary and suggested category and priority.
      </figcaption>
    </figure>
  );
}
