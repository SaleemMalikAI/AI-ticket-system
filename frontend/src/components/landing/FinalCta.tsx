import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Links } from "@/constants/links";

export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="px-4 pb-4 sm:px-6">
      <div className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-14 text-center text-white shadow-2xl shadow-indigo-600/20 sm:px-12 sm:py-16">
        <div
          aria-hidden
          className="absolute -top-24 -right-24 -z-10 size-72 rounded-full bg-white/10 blur-3xl"
        />
        <h2 id="cta-title" className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Let AI handle the first read
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-indigo-100">
          Create a ticket and see the summary, category and priority appear in seconds. You can
          change any of it.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={Links.NEW_TICKET}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50 active:scale-[0.98]"
          >
            Create your first ticket
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link
            href={Links.TICKETS}
            className="inline-flex h-12 items-center justify-center rounded-lg px-6 font-semibold text-white ring-1 ring-white/40 transition ring-inset hover:bg-white/10 active:scale-[0.98]"
          >
            Browse tickets
          </Link>
        </div>
      </div>
    </section>
  );
}
