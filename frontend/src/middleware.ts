import { NextResponse, type NextRequest } from "next/server";

import { Links, REDIRECTS } from "@/constants/links";
import { isPositiveInt, matchPath } from "@/utilities/url";

// Static links that would otherwise match a dynamic pattern (/tickets/new vs /tickets/:id)
const STATIC_LINKS = new Set<string>([Links.NEW_TICKET]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Alias / old URLs -> canonical page
  const target = REDIRECTS[pathname];
  if (target) return NextResponse.redirect(new URL(target, request.url), 308);

  // 2. /tickets/:id must be a positive integer, otherwise 404 without calling the backend
  const ticket = !STATIC_LINKS.has(pathname) && matchPath(Links.TICKET_DETAIL, pathname);
  if (ticket && !isPositiveInt(ticket.id)) {
    return withSecurityHeaders(NextResponse.rewrite(new URL(Links.NOT_FOUND, request.url)));
  }

  return withSecurityHeaders(NextResponse.next());
}

function withSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export const config = {
  // Skip Next internals and static/SEO files
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|llms.txt).*)"],
};
