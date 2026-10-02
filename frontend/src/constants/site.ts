export const SITE_NAME = "AI Support Tickets";
export const SITE_DESCRIPTION = "Support ticket management with AI triage";

/** Public URL of this frontend, used for canonical URLs, sitemap and llms.txt. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Backend URL as seen from the user's browser. */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Backend URL as seen from the Next.js server (e.g. generateMetadata).
 * Inside Docker that is the "backend" service, not localhost.
 */
export const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? API_URL;
