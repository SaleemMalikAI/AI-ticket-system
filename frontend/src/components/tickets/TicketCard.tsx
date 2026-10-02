import { ChevronRight, Clock, Sparkles } from "lucide-react";
import Link from "next/link";

import { CategoryBadge, PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { Links } from "@/constants/links";
import { PRIORITY_META } from "@/constants/ticket-meta";
import type { Ticket } from "@/types/ticket";
import { formatDateTime, formatRelative } from "@/utilities/format";
import { buildPath } from "@/utilities/url";

export function TicketCard({ ticket: t }: { ticket: Ticket }) {
  return (
    <Link
      href={buildPath(Links.TICKET_DETAIL, { id: t.id })}
      className="group relative block overflow-hidden rounded-2xl border border-border bg-surface p-4 pl-5 shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 sm:p-5 sm:pl-6"
    >
      {/* priority stripe (the priority badge carries the same info as text) */}
      <span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${PRIORITY_META[t.priority].stripe}`} />

      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-muted tabular-nums">#{t.id}</p>
          <h2 className="mt-0.5 font-semibold text-pretty transition-colors group-hover:text-primary dark:group-hover:text-indigo-300">
            {t.title}
          </h2>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <StatusBadge value={t.status} />
          <PriorityBadge value={t.priority} />
        </div>
      </div>

      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
        {t.ai_summary ? (
          <>
            <Sparkles className="mr-1 -mt-0.5 inline size-3.5 text-accent" aria-label="AI summary:" />
            {t.ai_summary}
          </>
        ) : (
          t.description
        )}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3">
        <CategoryBadge value={t.category} />
        <span className="inline-flex items-center gap-1.5 text-xs text-muted">
          <Clock className="size-3.5" aria-hidden />
          <time dateTime={t.created_at} title={formatDateTime(t.created_at)}>
            {formatRelative(t.created_at)}
          </time>
          <ChevronRight
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}
