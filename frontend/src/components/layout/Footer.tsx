import { LifeBuoy } from "lucide-react";
import Link from "next/link";

import { LANDING_NAV } from "@/constants/landing";
import { Anchors, Links } from "@/constants/links";
import { PAGES, Pages } from "@/constants/pages";
import { API_URL, SITE_DESCRIPTION, SITE_NAME } from "@/constants/site";

const linkClass = "text-sm text-muted transition hover:text-foreground";

interface FooterLink {
  label: string;
  href: string;
  /** "page": client-side <Link>; "file": plain <a> (sitemap, llms.txt); "external": new tab */
  kind: "page" | "file" | "external";
}

export function Footer() {
  const columns: { title: string; links: FooterLink[] }[] = [
    {
      title: "Product",
      links: [
        { label: PAGES[Pages.TICKETS].title, href: Links.TICKETS, kind: "page" },
        { label: PAGES[Pages.NEW_TICKET].title, href: Links.NEW_TICKET, kind: "page" },
        ...LANDING_NAV.filter((n) => n.anchor !== Anchors.DEVELOPERS).map(
          (n): FooterLink => ({ label: n.label, href: `${Links.HOME}#${n.anchor}`, kind: "page" }),
        ),
      ],
    },
    {
      title: "Developers",
      links: [
        { label: "API docs", href: `${API_URL}/docs`, kind: "external" },
        { label: "llms.txt", href: Links.LLMS, kind: "file" },
        { label: "Sitemap", href: Links.SITEMAP, kind: "file" },
      ],
    },
  ];

  return (
    <footer className="mt-16 border-t border-border bg-surface/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Link href={Links.HOME} className="inline-flex items-center gap-2.5 font-bold tracking-tight">
            <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
              <LifeBuoy className="size-4" aria-hidden />
            </span>
            {SITE_NAME}
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted">{SITE_DESCRIPTION}.</p>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-sm font-semibold">{col.title}</h2>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  {l.kind === "page" ? (
                    <Link href={l.href} className={linkClass}>
                      {l.label}
                    </Link>
                  ) : (
                    <a
                      href={l.href}
                      className={linkClass}
                      {...(l.kind === "external" && { target: "_blank", rel: "noopener noreferrer" })}
                    >
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-muted sm:px-6">
          © {new Date().getFullYear()} {SITE_NAME}. Built with Next.js, FastAPI and Groq.
        </p>
      </div>
    </footer>
  );
}
