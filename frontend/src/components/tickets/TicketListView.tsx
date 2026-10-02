"use client";

import { Inbox, Plus, SearchX, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button, buttonClasses } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorBox } from "@/components/ui/ErrorBox";
import { Links } from "@/constants/links";
import { FILTER_KEYS } from "@/constants/ticket";
import { LIST_STAGGER_MAX_ITEMS, LIST_STAGGER_MS } from "@/constants/ui";
import { restApi } from "@/rest-api";
import type { TicketFilters as Filters, TicketList } from "@/types/ticket";
import { errorText } from "@/utilities/errors";

import { TicketCard } from "./TicketCard";
import { TicketFilters } from "./TicketFilters";
import { TicketListSkeleton } from "./TicketListSkeleton";

export function TicketListView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Filters live in the URL so they survive refresh and are shareable
  const filters: Filters = Object.fromEntries(
    FILTER_KEYS.map((k) => [k, searchParams.get(k) || undefined]),
  );
  const activeCount = FILTER_KEYS.filter((k) => filters[k]).length;

  const [data, setData] = useState<TicketList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const queryKey = searchParams.toString();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await restApi.tickets.list(Object.fromEntries(new URLSearchParams(queryKey))));
    } catch (e) {
      setError(errorText(e));
    } finally {
      setLoading(false);
    }
  }, [queryKey]);

  useEffect(() => {
    load();
  }, [load]);

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}${params.size ? `?${params}` : ""}`, { scroll: false });
  }

  const clearFilters = () => router.replace(pathname, { scroll: false });

  const summary = data
    ? `${data.total} ${data.total === 1 ? "ticket" : "tickets"}${activeCount ? " match your filters" : ""} · triaged by AI`
    : "Loading tickets…";

  return (
    <div className="space-y-6">
      <PageHeader title="Tickets" description={<span aria-live="polite">{summary}</span>} />

      <TicketFilters filters={filters} activeCount={activeCount} onChange={setFilter} onClear={clearFilters} />

      {error && <ErrorBox message={error} onRetry={load} />}

      {loading && !data && !error && <TicketListSkeleton />}

      {data && data.items.length === 0 && !error &&
        (activeCount ? (
          <EmptyState
            icon={SearchX}
            title="No matching tickets"
            description="Nothing matches these filters. Try a different status, category or priority."
            action={
              <Button variant="secondary" icon={<X />} onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={Inbox}
            title="No tickets yet"
            description="Create your first ticket. AI will summarize it and suggest a category and priority."
            action={
              <Link href={Links.NEW_TICKET} className={buttonClasses("primary")}>
                <Plus aria-hidden />
                Create ticket
              </Link>
            }
          />
        ))}

      {data && data.items.length > 0 && (
        <ul aria-busy={loading} className={`grid gap-3 transition-opacity duration-200 ${loading ? "opacity-60" : ""}`}>
          {data.items.map((t, i) => (
            <li
              key={t.id}
              className="animate-fade-in"
              style={{ animationDelay: `${Math.min(i, LIST_STAGGER_MAX_ITEMS) * LIST_STAGGER_MS}ms` }}
            >
              <TicketCard ticket={t} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
