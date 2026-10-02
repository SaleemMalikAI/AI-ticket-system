"use client";

import { ArrowRight, RotateCcw, Save } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { MESSAGES } from "@/constants/messages";
import { CATEGORIES, EDITABLE_FIELDS, PRIORITIES, STATUSES } from "@/constants/ticket";
import { restApi } from "@/rest-api";
import type { Ticket, TicketUpdate } from "@/types/ticket";
import { errorText } from "@/utilities/errors";
import { label } from "@/utilities/format";

type Field = keyof typeof EDITABLE_FIELDS;
type Draft = Pick<Ticket, Field>;

const OPTIONS: Record<Field, readonly string[]> = {
  status: STATUSES,
  category: CATEGORIES,
  priority: PRIORITIES,
};

const toDraft = (t: Ticket): Draft => ({ status: t.status, category: t.category, priority: t.priority });

/**
 * Edits are kept as a local draft; "Save changes" asks for confirmation and
 * shows exactly what will change. Re-mounted (via key) after every save.
 */
export function TicketManagePanel({ ticket, onSaved }: { ticket: Ticket; onSaved: (t: Ticket) => void }) {
  const toast = useToast();
  const [draft, setDraft] = useState<Draft>(() => toDraft(ticket));
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);

  const changed = (Object.keys(EDITABLE_FIELDS) as Field[]).filter((f) => draft[f] !== ticket[f]);

  async function save() {
    setSaving(true);
    try {
      const patch = Object.fromEntries(changed.map((f) => [f, draft[f]])) as TicketUpdate;
      const updated = await restApi.tickets.update(ticket.id, patch);
      toast({ tone: "success", title: MESSAGES.ticketUpdated(ticket.id) });
      onSaved(updated);
    } catch (e) {
      toast({ tone: "error", title: MESSAGES.updateFailed, description: errorText(e) });
      setSaving(false);
      setConfirming(false);
    }
  }

  return (
    <section aria-labelledby="manage-heading" className="card space-y-4">
      <div className="flex items-center justify-between">
        <h2 id="manage-heading" className="text-sm font-semibold">
          Manage ticket
        </h2>
        {changed.length > 0 && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">
            {changed.length} unsaved
          </span>
        )}
      </div>

      {(Object.keys(EDITABLE_FIELDS) as Field[]).map((f) => (
        <Select
          key={f}
          id={`manage-${f}`}
          labelText={EDITABLE_FIELDS[f]}
          value={draft[f]}
          options={OPTIONS[f]}
          disabled={saving}
          onChange={(v) => setDraft((d) => ({ ...d, [f]: v }))}
        />
      ))}

      <div className="flex gap-2 pt-1">
        <Button
          variant="secondary"
          icon={<RotateCcw />}
          disabled={changed.length === 0 || saving}
          onClick={() => setDraft(toDraft(ticket))}
          aria-label="Reset changes"
        >
          Reset
        </Button>
        <Button
          className="flex-1"
          icon={<Save />}
          disabled={changed.length === 0}
          onClick={() => setConfirming(true)}
        >
          Save changes
        </Button>
      </div>

      <ConfirmDialog
        open={confirming}
        title={MESSAGES.confirmUpdateTitle(ticket.id)}
        description={MESSAGES.confirmUpdateBody}
        confirmLabel="Yes, update"
        loading={saving}
        onConfirm={save}
        onCancel={() => setConfirming(false)}
      >
        <ul className="space-y-2 rounded-lg border border-border bg-surface-muted/60 p-3 text-sm">
          {changed.map((f) => (
            <li key={f} className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="w-16 font-medium text-muted">{EDITABLE_FIELDS[f]}</span>
              <span className="text-muted line-through decoration-muted/60">{label(ticket[f])}</span>
              <ArrowRight className="size-3.5 text-muted" aria-label="to" />
              <span className="font-semibold">{label(draft[f])}</span>
            </li>
          ))}
        </ul>
      </ConfirmDialog>
    </section>
  );
}
