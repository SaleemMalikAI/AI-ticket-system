"use client";

import { ArrowRight, CircleCheck, FilePlus2, Plus, X } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";

import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { Links } from "@/constants/links";
import { MESSAGES } from "@/constants/messages";
import { CATEGORIES, PRIORITIES } from "@/constants/ticket";
import { restApi } from "@/rest-api";
import type { TicketDraft } from "@/types/assistant";
import type { Category, Priority, Ticket } from "@/types/ticket";
import { errorText } from "@/utilities/errors";
import { buildPath } from "@/utilities/url";

type State = { step: "draft" } | { step: "creating" } | { step: "created"; ticket: Ticket } | { step: "dismissed" };

/**
 * A ticket the AI drafted from a chat message. Nothing exists until the user
 * selects "Create ticket", which uses the normal create endpoint.
 */
export function DraftTicketCard({ draft }: { draft: TicketDraft }) {
  const toast = useToast();
  const id = useId();
  const [category, setCategory] = useState<Category>(draft.category);
  const [priority, setPriority] = useState<Priority>(draft.priority);
  const [state, setState] = useState<State>({ step: "draft" });

  async function create() {
    setState({ step: "creating" });
    try {
      const ticket = await restApi.tickets.create({ ...draft, category, priority });
      setState({ step: "created", ticket });
      toast({ tone: "success", title: MESSAGES.ticketCreated(ticket.id) });
    } catch (e) {
      setState({ step: "draft" });
      toast({ tone: "error", title: MESSAGES.draftCreateFailed, description: errorText(e) });
    }
  }

  if (state.step === "dismissed") {
    return <p className="text-xs text-muted italic">Draft dismissed. No ticket was created.</p>;
  }

  if (state.step === "created") {
    const { ticket } = state;
    return (
      <div className="animate-fade-in rounded-xl border border-emerald-300 bg-emerald-50/60 p-4 dark:border-emerald-400/30 dark:bg-emerald-400/5">
        <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
          <CircleCheck className="size-4" aria-hidden />
          Ticket #{ticket.id} created
        </p>
        <p className="mt-1.5 font-medium">{ticket.title}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <StatusBadge value={ticket.status} />
          <PriorityBadge value={ticket.priority} />
        </div>
        <Link
          href={buildPath(Links.TICKET_DETAIL, { id: ticket.id })}
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline dark:text-indigo-300"
        >
          Open ticket
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    );
  }

  const creating = state.step === "creating";

  return (
    <section
      aria-label="Draft ticket"
      className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/[0.03] p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-primary uppercase dark:text-indigo-300">
          <FilePlus2 className="size-4" aria-hidden />
          Draft ticket
        </p>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">
          Not created yet
        </span>
      </div>

      <h3 className="mt-3 font-semibold text-pretty">{draft.title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted">{draft.description}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Select id={`${id}-category`} labelText="Category" value={category} options={CATEGORIES} disabled={creating} onChange={(v) => setCategory(v as Category)} />
        <Select id={`${id}-priority`} labelText="Priority" value={priority} options={PRIORITIES} disabled={creating} onChange={(v) => setPriority(v as Priority)} />
      </div>

      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" icon={<X />} disabled={creating} onClick={() => setState({ step: "dismissed" })}>
          Dismiss
        </Button>
        <Button icon={<Plus />} loading={creating} onClick={create}>
          {creating ? "Creating…" : "Create ticket"}
        </Button>
      </div>
    </section>
  );
}
