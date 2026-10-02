import { ChevronDown } from "lucide-react";

import { FAQ } from "@/constants/landing";
import { Anchors } from "@/constants/links";

import { Section } from "./Section";

export function Faq() {
  return (
    <Section id={Anchors.FAQ} eyebrow="FAQ" title="Questions, answered">
      <div className="mx-auto max-w-3xl divide-y divide-border rounded-2xl border border-border bg-surface shadow-sm">
        {FAQ.map(({ question, answer }) => (
          // native <details>: keyboard and screen-reader friendly with no JS
          <details key={question} className="group px-5 sm:px-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-semibold [&::-webkit-details-marker]:hidden">
              {question}
              <ChevronDown
                className="size-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <p className="-mt-1 pb-5 text-sm leading-relaxed text-muted">{answer}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
