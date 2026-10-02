"use client";

import { Inbox, LifeBuoy, Plus, Sparkles, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { buttonClasses } from "@/components/ui/Button";
import { LANDING_NAV } from "@/constants/landing";
import { Links } from "@/constants/links";
import { PAGES, Pages } from "@/constants/pages";
import { SITE_NAME } from "@/constants/site";

function NavLink({ href, icon: Icon, label, active }: { href: string; icon: LucideIcon; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium transition ${
        active
          ? "bg-primary/10 text-primary dark:text-indigo-300"
          : "text-muted hover:bg-surface-muted hover:text-foreground"
      }`}
    >
      <Icon className="size-4" aria-hidden />
      {/* icon-only on phones; the label stays available to screen readers */}
      <span className="sr-only sm:not-sr-only">{label}</span>
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const onLanding = pathname === Links.HOME;
  const onNewTicket = pathname === Links.NEW_TICKET;
  const onTickets =
    !onNewTicket && (pathname === Links.TICKETS || pathname.startsWith(`${Links.TICKETS}/`));

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-surface/70 backdrop-blur-lg supports-[backdrop-filter]:bg-surface/60">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href={Links.HOME} className="flex items-center gap-2.5 rounded-lg font-bold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30">
            <LifeBuoy className="size-5" aria-hidden />
          </span>
          <span className="hidden sm:inline">{SITE_NAME}</span>
        </Link>

        {onLanding && (
          <ul className="hidden items-center gap-1 lg:flex">
            {LANDING_NAV.map((item) => (
              <li key={item.anchor}>
                <a
                  href={`#${item.anchor}`}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface-muted hover:text-foreground"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center gap-1 sm:gap-2">
          <NavLink href={Links.TICKETS} icon={Inbox} label={PAGES[Pages.TICKETS].title} active={onTickets} />
          <NavLink href={Links.ASK} icon={Sparkles} label={PAGES[Pages.ASK].title} active={pathname === Links.ASK} />
          {!onNewTicket && (
            <Link href={Links.NEW_TICKET} className={buttonClasses("primary", "sm")}>
              <Plus aria-hidden />
              {PAGES[Pages.NEW_TICKET].title}
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
