"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { ErrorBox } from "@/components/ui/ErrorBox";
import { Select } from "@/components/ui/Select";
import { Links } from "@/constants/links";
import { ALL_LABEL, CATEGORIES, FILTER_KEYS, PRIORITIES, STATUSES } from "@/constants/ticket";
import { restApi } from "@/rest-api";
import type { TicketFilters, TicketList } from "@/types/ticket";
import { errorText } from "@/utilities/errors";
import { formatDateTime, label } from "@/utilities/format";
import { buildPath } from "@/utilities/url";

export function TicketListView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Filters live in the URL so they survive refresh and are shareable
  const filters: TicketFilters = Object.fromEntries(
    FILTER_KEYS.map((k) => [k, searchParams.get(k) || undefined]),
  );

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
    router.replace(`${pathname}${params.size ? `?${params}` : ""}`);
  }

  const hasFilters = FILTER_KEYS.some((k) => filters[k]);

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Tickets</h1>
        {data && <span className="text-sm text-slate-500">{data.total} total</span>}
      </div>

      <div className="card grid gap-4 sm:grid-cols-4">
        <Select id="f-status" labelText="Status" value={filters.status ?? ""} options={STATUSES} emptyLabel={ALL_LABEL} onChange={(v) => setFilter("status", v)} />
        <Select id="f-category" labelText="Category" value={filters.category ?? ""} options={CATEGORIES} emptyLabel={ALL_LABEL} onChange={(v) => setFilter("category", v)} />
        <Select id="f-priority" labelText="Priority" value={filters.priority ?? ""} options={PRIORITIES} emptyLabel={ALL_LABEL} onChange={(v) => setFilter("priority", v)} />
        <div className="flex items-end">
          <button className="btn-secondary w-full" disabled={!hasFilters} onClick={() => router.replace(pathname)}>
            Clear filters
          </button>
        </div>
      </div>

      {error && <ErrorBox message={error} onRetry={load} />}

      {loading && !data && <p className="text-sm text-slate-500">Loading tickets…</p>}

      {data && data.items.length === 0 && !error && (
        <div className="card text-center text-sm text-slate-500">
          {hasFilters ? "No tickets match these filters." : "No tickets yet."}{" "}
          <Link href={Links.NEW_TICKET} className="font-medium text-slate-900 underline">
            Create one
          </Link>
        </div>
      )}

      {data && data.items.length > 0 && (
        <ul className={`space-y-3 transition-opacity ${loading ? "opacity-50" : ""}`}>
          {data.items.map((t) => (
            <li key={t.id}>
              <Link href={buildPath(Links.TICKET_DETAIL, { id: t.id })} className="card block hover:border-slate-400">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-medium">
                    <span className="text-slate-400">#{t.id}</span> {t.title}
                  </h2>
                  <div className="flex gap-2">
                    <Badge value={t.status} />
                    <Badge value={t.priority} />
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                  {t.ai_summary ?? t.description}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  {label(t.category)} · {formatDateTime(t.created_at)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
