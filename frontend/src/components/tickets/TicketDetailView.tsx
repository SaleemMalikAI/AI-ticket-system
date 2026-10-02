"use client";

import { Clock, History, SearchX } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { CategoryBadge, PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorBox } from "@/components/ui/ErrorBox";
import { Skeleton } from "@/components/ui/Skeleton";
import { Links } from "@/constants/links";
import { ApiError, restApi } from "@/rest-api";
import type { Ticket } from "@/types/ticket";
import { errorText } from "@/utilities/errors";
import { formatDateTime, formatRelative } from "@/utilities/format";

import { AiAnalysisCard } from "./AiAnalysisCard";
import { DeleteTicketCard } from "./DeleteTicketCard";
import { TicketManagePanel } from "./TicketManagePanel";

const BACK = { href: Links.HOME, label: "All tickets" };

function DetailSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading ticket">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-9 w-2/3" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}

export function TicketDetailView({ id }: { id: string }) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTicket(await restApi.tickets.get(id));
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) setNotFound(true);
      else setError(errorText(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !ticket) return <DetailSkeleton />;

  if (notFound)
    return (
      <EmptyState
        icon={SearchX}
        title={`Ticket #${id} not found`}
        description="It may have been deleted, or the link is wrong."
        action={
          <Link href={Links.HOME} className={buttonClasses("secondary")}>
            Back to tickets
          </Link>
        }
      />
    );

  if (!ticket)
    return (
      <div className="space-y-6">
        <PageHeader title="Ticket" back={BACK} />
        <ErrorBox message={error ?? "Something went wrong"} onRetry={load} />
      </div>
    );

  const edited = ticket.updated_at !== ticket.created_at;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        back={BACK}
        title={
          <>
            <span className="text-muted tabular-nums">#{ticket.id}</span> {ticket.title}
          </>
        }
        description={
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex flex-wrap gap-1.5">
              <StatusBadge value={ticket.status} />
              <PriorityBadge value={ticket.priority} />
              <CategoryBadge value={ticket.category} />
            </div>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden />
              Created{" "}
              <time dateTime={ticket.created_at} title={formatDateTime(ticket.created_at)}>
                {formatRelative(ticket.created_at)}
              </time>
            </span>
            {edited && (
              <span className="inline-flex items-center gap-1.5">
                <History className="size-3.5" aria-hidden />
                Updated{" "}
                <time dateTime={ticket.updated_at} title={formatDateTime(ticket.updated_at)}>
                  {formatRelative(ticket.updated_at)}
                </time>
              </span>
            )}
          </div>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <AiAnalysisCard ticket={ticket} />
          <section aria-labelledby="description-heading" className="card">
            <h2 id="description-heading" className="text-sm font-semibold">
              Description
            </h2>
            <p className="mt-3 max-w-prose text-[15px] leading-relaxed whitespace-pre-wrap text-foreground/90">
              {ticket.description}
            </p>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24">
          {/* key: reset the draft whenever the saved ticket changes */}
          <TicketManagePanel key={ticket.updated_at} ticket={ticket} onSaved={setTicket} />
          <DeleteTicketCard ticket={ticket} />
        </aside>
      </div>
    </div>
  );
}
