/**
 * Every URL the frontend serves. Dynamic segments use ":name" and are filled
 * with buildPath() from "@/utilities/url".
 */
export enum Links {
  HOME = "/",
  TICKETS = "/tickets", // alias, redirected to HOME by middleware
  NEW_TICKET = "/tickets/new",
  TICKET_DETAIL = "/tickets/:id",
  NOT_FOUND = "/not-found", // middleware rewrites invalid URLs here (renders a 404)
  SITEMAP = "/sitemap.xml",
  ROBOTS = "/robots.txt",
  LLMS = "/llms.txt",
}

/** Old or alias URLs and where middleware sends them (308 permanent redirect). */
export const REDIRECTS: Partial<Record<string, Links>> = {
  [Links.TICKETS]: Links.HOME,
};
