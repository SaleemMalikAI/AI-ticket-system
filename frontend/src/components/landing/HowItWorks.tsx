import { HOW_IT_WORKS } from "@/constants/landing";
import { Anchors } from "@/constants/links";

import { Section } from "./Section";

export function HowItWorks() {
  return (
    <Section
      id={Anchors.HOW_IT_WORKS}
      eyebrow="How it works"
      title="From a raw complaint to a triaged ticket"
      subtitle="Three steps, and the AI only ever suggests. People make the final call."
    >
      <ol className="relative grid gap-6 md:grid-cols-3">
        {/* connector line behind the step numbers (desktop) */}
        <div
          aria-hidden
          className="absolute top-6 right-[16%] left-[16%] hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block"
        />
        {HOW_IT_WORKS.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="relative text-center">
            <span className="relative mx-auto grid size-12 place-items-center rounded-2xl border border-border bg-surface text-primary shadow-sm dark:text-indigo-300">
              <Icon className="size-5" aria-hidden />
              <span className="absolute -top-2 -right-2 grid size-5 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                {i + 1}
              </span>
            </span>
            <h3 className="mt-5 text-lg font-semibold">{title}</h3>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted">{text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
