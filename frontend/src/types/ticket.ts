// Mirrors backend/app/schemas.py

import type { CATEGORIES, PRIORITIES, STATUSES } from "@/constants/ticket";

export type Category = (typeof CATEGORIES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type Status = (typeof STATUSES)[number];

export interface Ticket {
  id: number;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  ai_summary: string | null;
  ai_category: Category | null;
  ai_priority: Priority | null;
  created_at: string;
  updated_at: string;
}

export interface TicketList {
  items: Ticket[];
  total: number;
}

export interface TicketCreate {
  title: string;
  description: string;
  category?: Category;
  priority?: Priority;
}

export type TicketUpdate = Partial<Pick<Ticket, "status" | "category" | "priority">>;

export interface TicketFilters {
  status?: Status;
  category?: Category;
  priority?: Priority;
  /** text search in title, description and AI summary */
  q?: string;
}
