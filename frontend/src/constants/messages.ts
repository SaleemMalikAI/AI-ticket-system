/** Texts for toasts and confirmation dialogs. */
export const MESSAGES = {
  ticketCreated: (id: number) => `Ticket #${id} created`,
  aiSuggested: (category: string, priority: string) => `AI suggested ${category} · ${priority}`,
  aiUnavailable: "AI was unavailable, so default category and priority were used.",
  createFailed: "Could not create the ticket",

  confirmUpdateTitle: (id: number) => `Update ticket #${id}?`,
  confirmUpdateBody: "The following changes will be saved:",
  ticketUpdated: (id: number) => `Ticket #${id} updated`,
  updateFailed: "Could not update the ticket",

  confirmDeleteTitle: (id: number) => `Delete ticket #${id}?`,
  confirmDeleteBody: (title: string) =>
    `"${title}" and its AI analysis will be permanently removed. This cannot be undone.`,
  ticketDeleted: (id: number) => `Ticket #${id} deleted`,
  deleteFailed: "Could not delete the ticket",

  confirmDiscardTitle: "Discard this ticket?",
  confirmDiscardBody: "You have unsaved text. If you leave now it will be lost.",
} as const;
