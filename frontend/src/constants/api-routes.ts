/**
 * Every backend (FastAPI) endpoint the frontend calls. Dynamic segments use
 * ":name" and are filled by the rest-api client.
 */
export enum ApiRoutes {
  HEALTH = "/health",
  TICKETS = "/api/tickets",
  TICKET_BY_ID = "/api/tickets/:id",
  ASSISTANT_ASK = "/api/assistant/ask",
}

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PATCH = "PATCH",
  DELETE = "DELETE",
}
