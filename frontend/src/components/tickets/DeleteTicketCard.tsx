"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { Links } from "@/constants/links";
import { MESSAGES } from "@/constants/messages";
import { restApi } from "@/rest-api";
import type { Ticket } from "@/types/ticket";
import { errorText } from "@/utilities/errors";

export function DeleteTicketCard({ ticket }: { ticket: Ticket }) {
  const router = useRouter();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    setDeleting(true);
    try {
      await restApi.tickets.remove(ticket.id);
      toast({ tone: "success", title: MESSAGES.ticketDeleted(ticket.id) });
      router.push(Links.TICKETS);
    } catch (e) {
      toast({ tone: "error", title: MESSAGES.deleteFailed, description: errorText(e) });
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <section
      aria-labelledby="danger-heading"
      className="rounded-2xl border border-red-200 bg-red-50/50 p-5 dark:border-red-400/20 dark:bg-red-400/5"
    >
      <h2 id="danger-heading" className="text-sm font-semibold text-red-700 dark:text-red-300">
        Danger zone
      </h2>
      <p className="mt-1 text-sm text-muted">Deleting a ticket is permanent and cannot be undone.</p>
      <Button variant="danger" className="mt-4 w-full" icon={<Trash2 />} onClick={() => setConfirming(true)}>
        Delete ticket
      </Button>

      <ConfirmDialog
        open={confirming}
        tone="danger"
        title={MESSAGES.confirmDeleteTitle(ticket.id)}
        description={MESSAGES.confirmDeleteBody(ticket.title)}
        confirmLabel="Yes, delete"
        loading={deleting}
        onConfirm={remove}
        onCancel={() => setConfirming(false)}
      />
    </section>
  );
}
