import Link from "next/link";

import { Links } from "@/constants/links";
import { PAGES, Pages } from "@/constants/pages";
import { SITE_NAME } from "@/constants/site";

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href={Links.HOME} className="font-semibold">
          {SITE_NAME}
        </Link>
        <Link href={Links.NEW_TICKET} className="btn-primary">
          {PAGES[Pages.NEW_TICKET].title}
        </Link>
      </nav>
    </header>
  );
}
