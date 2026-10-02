import type { PageConfig } from "@/types/page";

import { Links } from "./links";

/** Every page in the app. Add a page here first, then give it a config below. */
export enum Pages {
  HOME = "HOME",
  NEW_TICKET = "NEW_TICKET",
  TICKET_DETAIL = "TICKET_DETAIL",
  NOT_FOUND = "NOT_FOUND",
}

/**
 * Link + SEO metadata for each page. Used by page `metadata` exports,
 * sitemap.xml, robots.txt and llms.txt, so they never drift apart.
 */
export const PAGES: Record<Pages, PageConfig> = {
  [Pages.HOME]: {
    link: Links.HOME,
    title: "Tickets",
    description:
      "Browse and filter all support tickets by status, category and priority, with AI-generated summaries.",
    indexable: true,
    sitemap: { changeFrequency: "daily", priority: 1 },
  },
  [Pages.NEW_TICKET]: {
    link: Links.NEW_TICKET,
    title: "New ticket",
    description:
      "Create a support ticket. AI writes a summary and suggests a category and priority, which you can override.",
    indexable: true,
    sitemap: { changeFrequency: "monthly", priority: 0.8 },
  },
  [Pages.TICKET_DETAIL]: {
    link: Links.TICKET_DETAIL,
    title: "Ticket",
    description: "Ticket details, AI analysis, and status, category and priority management.",
    // tickets hold customer data: keep them out of search engines
    indexable: false,
  },
  [Pages.NOT_FOUND]: {
    link: Links.NOT_FOUND,
    title: "Page not found",
    description: "The page you are looking for does not exist.",
    indexable: false,
  },
};
