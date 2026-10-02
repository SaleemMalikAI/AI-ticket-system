// Mirrors backend/app/schemas/assistant.py

import type { Category, Priority, Status, Ticket } from "./ticket";

export type AssistantIntent = "list" | "count" | "stats" | "summarize" | "create";
export type DateRange = "today" | "last_7_days" | "last_30_days";
export type GroupBy = "status" | "category" | "priority";

/** What the AI planned to look up. The backend runs it; the AI never writes SQL. */
export interface QueryPlan {
  intent: AssistantIntent;
  status: Status | null;
  category: Category | null;
  priority: Priority | null;
  q: string | null;
  date_range: DateRange | null;
  group_by: GroupBy | null;
  limit: number;
}

/** A ticket the AI proposes (intent "create"). Nothing is saved until the user confirms it. */
export interface TicketDraft {
  title: string;
  description: string;
  category: Category;
  priority: Priority;
}

export interface AskRequest {
  question: string;
}

export interface AskResponse {
  answer: string;
  /** null when the question could not be turned into a plan */
  plan: QueryPlan | null;
  tickets: Ticket[];
  /** counts per group for intent "stats", e.g. { open: 3, closed: 1 } */
  stats: Record<string, number> | null;
  /** intent "create": the drafted ticket, shown as a card for the user to confirm */
  draft: TicketDraft | null;
}
