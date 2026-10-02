import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { Links } from "@/constants/links";
import { PRIORITY_META } from "@/constants/ticket-meta";
import type { Ticket } from "@/types/ticket";
import { buildPath } from "@/utilities/url";

export function TicketMiniCard({ ticket: t }: { ticket: Ticket }) {
  return (
    <Link
      href={buildPath(Links.TICKET_DETAIL, { id: t.id })}
      className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-border bg-surface py-2.5 pr-3 pl-4 transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-md"
    >
      <span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${PRIORITY_META[t.priority].stripe}`} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold group-hover:text-primary dark:group-hover:text-indigo-300">
          <span className="text-muted tabular-nums">#{t.id}</span> {t.title}
        </p>
        {t.ai_summary && <p className="mt-0.5 truncate text-xs text-muted">{t.ai_summary}</p>}
      </div>
      <div className="hidden shrink-0 gap-1.5 sm:flex">
        <StatusBadge value={t.status} />
        <PriorityBadge value={t.priority} />
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" aria-hidden />
    </Link>
  );
}
