import { ArrowRight, Check, Sparkles } from "lucide-react";
import Link from "next/link";

import { buttonClasses } from "@/components/ui/Button";
import { HERO } from "@/constants/landing";
import { Links } from "@/constants/links";

import { ProductPreview } from "./ProductPreview";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <div aria-hidden className="bg-grid absolute inset-0 -z-10" />

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pt-14 pb-20 sm:px-6 sm:pt-20 lg:grid-cols-2 lg:gap-10 lg:pt-24 lg:pb-28">
        <div className="text-center lg:text-left">
          <p className="inline-flex animate-fade-in items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary dark:text-indigo-300">
            <Sparkles className="size-4" aria-hidden />
            {HERO.eyebrow}
          </p>

          <h1
            id="hero-title"
            className="mt-6 animate-fade-in text-4xl font-extrabold tracking-tight text-balance [animation-delay:60ms] sm:text-5xl lg:text-6xl"
          >
            {HERO.titleLead}{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              {HERO.titleHighlight}
            </span>{" "}
            {HERO.titleTail}
          </h1>

          <p className="mx-auto mt-6 max-w-xl animate-fade-in text-lg leading-relaxed text-pretty text-muted [animation-delay:120ms] lg:mx-0">
            {HERO.subtitle}
          </p>

          <div className="mt-8 flex animate-fade-in flex-col justify-center gap-3 [animation-delay:180ms] sm:flex-row lg:justify-start">
            <Link href={Links.NEW_TICKET} className={buttonClasses("primary", "md", "h-12 px-6 text-base")}>
              Create a ticket
              <ArrowRight aria-hidden />
            </Link>
            <Link href={Links.TICKETS} className={buttonClasses("secondary", "md", "h-12 px-6 text-base")}>
              View tickets
            </Link>
          </div>

          <ul className="mt-8 flex animate-fade-in flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted [animation-delay:240ms] lg:justify-start">
            {HERO.highlights.map((h) => (
              <li key={h} className="inline-flex items-center gap-1.5">
                <Check className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
                {h}
              </li>
            ))}
          </ul>
        </div>

        <div className="animate-fade-in [animation-delay:200ms]">
          <ProductPreview />
        </div>
      </div>
    </section>
  );
}
