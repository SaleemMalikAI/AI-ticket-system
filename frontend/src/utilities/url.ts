type Params = Record<string, string | number>;
type Query = Record<string, string | number | undefined | null>;

/** buildPath(Links.TICKET_DETAIL, { id: 5 }) -> "/tickets/5" */
export function buildPath(pattern: string, params: Params = {}): string {
  return pattern.replace(/:(\w+)/g, (_, key: string) => {
    if (params[key] === undefined) throw new Error(`Missing param "${key}" for ${pattern}`);
    return encodeURIComponent(String(params[key]));
  });
}

/** withQuery("/api/tickets", { status: "open", category: "" }) -> "/api/tickets?status=open" */
export function withQuery(path: string, query: Query = {}): string {
  const qs = new URLSearchParams(
    Object.entries(query)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => [k, String(v)]),
  ).toString();
  return qs ? `${path}?${qs}` : path;
}

/**
 * matchPath(Links.TICKET_DETAIL, "/tickets/5") -> { id: "5" }
 * Returns null when the pathname does not fit the pattern.
 */
export function matchPath(pattern: string, pathname: string): Record<string, string> | null {
  const names: string[] = [];
  const regex = new RegExp(
    "^" +
      pattern.replace(/:(\w+)/g, (_, name: string) => {
        names.push(name);
        return "([^/]+)";
      }) +
      "/?$",
  );
  const match = regex.exec(pathname);
  if (!match) return null;
  return Object.fromEntries(names.map((n, i) => [n, decodeURIComponent(match[i + 1])]));
}

export const isPositiveInt = (value: string) => /^[1-9]\d*$/.test(value);
