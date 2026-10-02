/**
 * Every URL the frontend serves. Dynamic segments use ":name" and are filled
 * with buildPath() from "@/utilities/url".
 */
export enum Links {
  HOME = "/", // landing page
  TICKETS = "/tickets",
  NEW_TICKET = "/tickets/new",
  TICKET_DETAIL = "/tickets/:id",
  NOT_FOUND = "/not-found", // middleware rewrites invalid URLs here (renders a 404)
  SITEMAP = "/sitemap.xml",
  ROBOTS = "/robots.txt",
  LLMS = "/llms.txt",
}

/** Section ids on the landing page, used as `${Links.HOME}#${Anchors.X}`. */
export enum Anchors {
  HOW_IT_WORKS = "how-it-works",
  FEATURES = "features",
  TRIAGE = "triage",
  DEVELOPERS = "developers",
  FAQ = "faq",
}

/** Old or alias URLs and where middleware sends them (308 permanent redirect). */
export const REDIRECTS: Partial<Record<string, Links>> = {
  "/home": Links.HOME,
};
