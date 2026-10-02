import { healthRoutes } from "./health/routes";
import { ticketRoutes } from "./tickets/routes";

/** Usage: restApi.tickets.list({ status: "open" }) */
export const restApi = {
  health: healthRoutes,
  tickets: ticketRoutes,
};

export { ApiError, apiRequest, type RequestOptions } from "./client";
