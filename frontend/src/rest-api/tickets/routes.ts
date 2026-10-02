import { ApiRoutes, HttpMethod } from "@/constants/api-routes";
import type { Ticket, TicketCreate, TicketFilters, TicketList, TicketUpdate } from "@/types/ticket";

import { apiRequest } from "../client";

export const ticketRoutes = {
  list: (filters: TicketFilters = {}) =>
    apiRequest<TicketList>(ApiRoutes.TICKETS, { query: { ...filters } }),

  get: (id: number | string) => apiRequest<Ticket>(ApiRoutes.TICKET_BY_ID, { params: { id } }),

  create: (data: TicketCreate) =>
    apiRequest<Ticket>(ApiRoutes.TICKETS, { method: HttpMethod.POST, body: data }),

  update: (id: number, data: TicketUpdate) =>
    apiRequest<Ticket>(ApiRoutes.TICKET_BY_ID, { method: HttpMethod.PATCH, params: { id }, body: data }),

  remove: (id: number) =>
    apiRequest<void>(ApiRoutes.TICKET_BY_ID, { method: HttpMethod.DELETE, params: { id } }),
};
