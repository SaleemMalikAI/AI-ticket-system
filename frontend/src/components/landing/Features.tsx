import { FEATURES } from "@/constants/landing";
import { Anchors } from "@/constants/links";

import { Section } from "./Section";

export function Features() {
  return (
    <Section
      id={Anchors.FEATURES}
      eyebrow="Features"
      title="Everything a small support team needs"
      subtitle="AI does the reading and sorting, so your team can spend its time solving problems."
      className="border-y border-border bg-surface/40"
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <li
            key={title}
            className="group card transition-[border-color,box-shadow] duration-200 hover:border-primary/30 hover:shadow-md"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-violet-500/15 text-primary transition-colors group-hover:from-indigo-500 group-hover:to-violet-600 group-hover:text-white dark:text-indigo-300">
              <Icon className="size-5" aria-hidden />
            </span>
            <h3 className="mt-4 font-semibold">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
