"use client";

import { Inbox, LifeBuoy, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { buttonClasses } from "@/components/ui/Button";
import { Links } from "@/constants/links";
import { PAGES, Pages } from "@/constants/pages";
import { SITE_NAME } from "@/constants/site";

export function Header() {
  const pathname = usePathname();
  const onNewTicket = pathname === Links.NEW_TICKET;
  const onTickets = !onNewTicket && (pathname === Links.HOME || pathname.startsWith(`${Links.TICKETS}/`));

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-surface/70 backdrop-blur-lg supports-[backdrop-filter]:bg-surface/60">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href={Links.HOME} className="flex items-center gap-2.5 rounded-lg font-bold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30">
            <LifeBuoy className="size-5" aria-hidden />
          </span>
          <span className="hidden sm:inline">{SITE_NAME}</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href={Links.HOME}
            aria-current={onTickets ? "page" : undefined}
            className={`inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium transition ${
              onTickets ? "bg-primary/10 text-primary dark:text-indigo-300" : "text-muted hover:bg-surface-muted hover:text-foreground"
            }`}
          >
            <Inbox className="size-4" aria-hidden />
            {PAGES[Pages.HOME].title}
          </Link>
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
