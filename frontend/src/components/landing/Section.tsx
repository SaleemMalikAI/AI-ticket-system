import type { ReactNode } from "react";

import type { Anchors } from "@/constants/links";

interface Props {
  id: Anchors;
  eyebrow: string;
  title: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
}

/** Landing page section: centered heading block + content. */
export function Section({ id, eyebrow, title, subtitle, className = "", children }: Props) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`py-20 sm:py-24 ${className}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-primary dark:text-indigo-300">{eyebrow}</p>
          <h2 id={`${id}-title`} className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {title}
          </h2>
          {subtitle && <p className="mt-4 text-base leading-relaxed text-pretty text-muted">{subtitle}</p>}
        </div>
        <div className="mt-12 sm:mt-14">{children}</div>
      </div>
    </section>
  );
}
