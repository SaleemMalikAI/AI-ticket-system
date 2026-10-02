"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { ErrorBox } from "@/components/ui/ErrorBox";
import { Select } from "@/components/ui/Select";
import { Links } from "@/constants/links";
import { CATEGORIES, PRIORITIES, STATUSES } from "@/constants/ticket";
import { ApiError, restApi } from "@/rest-api";
import type { Ticket, TicketUpdate } from "@/types/ticket";
import { errorText } from "@/utilities/errors";
import { formatDateTime, label } from "@/utilities/format";

export function TicketDetailView({ id }: { id: string }) {
  const router = useRouter();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  async function update(patch: TicketUpdate) {
    if (!ticket) return;
    setSaving(true);
    setError(null);
    try {
      setTicket(await restApi.tickets.update(ticket.id, patch));
    } catch (e) {
      setError(errorText(e));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!ticket || !confirm(`Delete ticket #${ticket.id}?`)) return;
    setSaving(true);
    try {
      await restApi.tickets.remove(ticket.id);
      router.push(Links.HOME);
    } catch (e) {
      setError(errorText(e));
      setSaving(false);
    }
  }

  if (loading && !ticket) return <p className="text-sm text-slate-500">Loading ticket…</p>;

  if (notFound)
    return (
      <div className="card text-center">
        <p>Ticket #{id} was not found.</p>
        <Link href={Links.HOME} className="mt-2 inline-block text-sm underline">
          Back to tickets
        </Link>
      </div>
    );

  if (!ticket) return <ErrorBox message={error ?? "Something went wrong"} onRetry={load} />;

  const overridden = (value: string, ai: string | null) => ai !== null && ai !== value;

  return (
    <div className="space-y-6">
      <Link href={Links.HOME} className="text-sm text-slate-500 hover:text-slate-900">
        ← All tickets
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            <span className="text-slate-400">#{ticket.id}</span> {ticket.title}
          </h1>
          <p className="mt-1 text-xs text-slate-500">Created {formatDateTime(ticket.created_at)}</p>
        </div>
        <div className="flex gap-2">
          <Badge value={ticket.status} />
          <Badge value={ticket.priority} />
          <Badge value={ticket.category} />
        </div>
      </div>

      {error && <ErrorBox message={error} />}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <section className="card border-violet-200 bg-violet-50/40">
            <h2 className="mb-2 text-sm font-semibold text-violet-900">✨ AI analysis</h2>
            {ticket.ai_summary ? (
              <>
                <p className="text-sm">{ticket.ai_summary}</p>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt className="text-slate-500">Suggested category</dt>
                    <dd className="font-medium">
                      {label(ticket.ai_category!)}
                      {overridden(ticket.category, ticket.ai_category) && (
                        <span className="ml-1 text-amber-700">(overridden)</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Suggested priority</dt>
                    <dd className="font-medium">
                      {label(ticket.ai_priority!)}
                      {overridden(ticket.priority, ticket.ai_priority) && (
                        <span className="ml-1 text-amber-700">(overridden)</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                AI analysis was unavailable when this ticket was created. Default category and
                priority were applied.
              </p>
            )}
          </section>

          <section className="card">
            <h2 className="mb-2 text-sm font-semibold">Description</h2>
            <p className="whitespace-pre-wrap text-sm text-slate-700">{ticket.description}</p>
          </section>
        </div>

        <aside className="card h-fit space-y-4">
          <h2 className="text-sm font-semibold">Manage</h2>
          <Select id="status" labelText="Status" value={ticket.status} options={STATUSES} disabled={saving} onChange={(v) => update({ status: v as Ticket["status"] })} />
          <Select id="category" labelText="Category" value={ticket.category} options={CATEGORIES} disabled={saving} onChange={(v) => update({ category: v as Ticket["category"] })} />
          <Select id="priority" labelText="Priority" value={ticket.priority} options={PRIORITIES} disabled={saving} onChange={(v) => update({ priority: v as Ticket["priority"] })} />
          {saving && <p className="text-xs text-slate-500">Saving…</p>}
          <button className="btn-danger w-full" onClick={remove} disabled={saving}>
            Delete ticket
          </button>
        </aside>
      </div>
    </div>
  );
}
