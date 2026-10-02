import type { Metadata } from "next";

import { PAGES, type Pages } from "@/constants/pages";
import { SITE_NAME } from "@/constants/site";

interface Overrides {
  title?: string;
  description?: string;
  /** concrete path for dynamic pages, e.g. "/tickets/5" (defaults to the page link) */
  path?: string;
}

/** Builds the Next.js metadata (title, description, canonical, OG, robots) for a page. */
export function buildMetadata(page: Pages, overrides: Overrides = {}): Metadata {
  const config = PAGES[page];
  const title = overrides.title ?? config.title;
  const description = overrides.description ?? config.description;
  const path = overrides.path ?? config.link;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: SITE_NAME, type: "website" },
    robots: config.indexable ? { index: true, follow: true } : { index: false, follow: false },
  };
}
