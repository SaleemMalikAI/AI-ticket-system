import { HttpMethod, type ApiRoutes } from "@/constants/api-routes";
import { API_INTERNAL_URL, API_URL } from "@/constants/site";
import { parseErrorMessage } from "@/utilities/errors";
import { buildPath, withQuery } from "@/utilities/url";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export interface RequestOptions {
  method?: HttpMethod;
  /** fills ":name" segments of the route, e.g. { id: 5 } */
  params?: Record<string, string | number>;
  query?: Record<string, string | number | undefined | null>;
  body?: unknown;
  signal?: AbortSignal;
}

// The browser reaches the backend on the host port; the Next.js server
// (generateMetadata) reaches it through the Docker network.
const baseUrl = () => (typeof window === "undefined" ? API_INTERNAL_URL : API_URL);

/** Single entry point for every backend call: apiRequest(ApiRoutes.TICKETS, {...}) */
export async function apiRequest<T>(route: ApiRoutes, options: RequestOptions = {}): Promise<T> {
  const { method = HttpMethod.GET, params, query, body, signal } = options;
  const url = baseUrl() + withQuery(buildPath(route, params), query);

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal,
    });
  } catch {
    throw new ApiError(0, "Cannot reach the API. Is the backend running?");
  }

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, parseErrorMessage(data, `Request failed (${res.status})`));
  return data as T;
}
