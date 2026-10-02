import { assistantRoutes } from "./assistant/routes";
import { healthRoutes } from "./health/routes";
import { ticketRoutes } from "./tickets/routes";

/** Usage: restApi.tickets.list({ status: "open" }), restApi.assistant.ask("open urgent tickets") */
export const restApi = {
  assistant: assistantRoutes,
  health: healthRoutes,
  tickets: ticketRoutes,
};

export { ApiError, apiRequest, type RequestOptions } from "./client";
