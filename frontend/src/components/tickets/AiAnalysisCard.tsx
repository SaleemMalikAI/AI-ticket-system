import { Info, Sparkles } from "lucide-react";

import { CategoryBadge, PriorityBadge } from "@/components/ui/Badge";
import type { Ticket } from "@/types/ticket";

function Overridden() {
  return (
    <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">
      Overridden
    </span>
  );
}

export function AiAnalysisCard({ ticket }: { ticket: Ticket }) {
  const categoryOverridden = ticket.ai_category !== null && ticket.ai_category !== ticket.category;
  const priorityOverridden = ticket.ai_priority !== null && ticket.ai_priority !== ticket.priority;

  return (
    // gradient border: 1px padding around the inner surface
    <section
      aria-labelledby="ai-heading"
      className="rounded-2xl bg-gradient-to-br from-violet-400/60 via-indigo-400/40 to-sky-400/40 p-px shadow-sm"
    >
      <div className="rounded-[calc(1rem-1px)] bg-surface p-5">
        <h2 id="ai-heading" className="flex items-center gap-2 text-sm font-semibold">
          <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
            <Sparkles className="size-4" aria-hidden />
          </span>
          AI analysis
        </h2>

        {ticket.ai_summary ? (
          <>
            <p className="mt-3 text-[15px] leading-relaxed text-pretty">{ticket.ai_summary}</p>
            <dl className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium text-muted">Suggested category</dt>
                <dd className="mt-1 flex flex-wrap items-center gap-2">
                  <CategoryBadge value={ticket.ai_category!} />
                  {categoryOverridden && <Overridden />}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted">Suggested priority</dt>
                <dd className="mt-1 flex flex-wrap items-center gap-2">
                  <PriorityBadge value={ticket.ai_priority!} />
                  {priorityOverridden && <Overridden />}
                </dd>
              </div>
            </dl>
          </>
        ) : (
          <p className="mt-3 flex items-start gap-2 text-sm text-muted">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            AI analysis was unavailable when this ticket was created. Default category and priority
            were applied.
          </p>
        )}
      </div>
    </section>
  );
}
