/** FastAPI returns {detail: string} or {detail: [{loc, msg}, ...]} for 422s */
export function parseErrorMessage(body: unknown, fallback: string): string {
  const detail = (body as { detail?: unknown })?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((d: { loc?: string[]; msg?: string }) => `${d.loc?.at(-1) ?? "field"}: ${d.msg}`)
      .join(", ");
  }
  return fallback;
}

export const errorText = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong");
