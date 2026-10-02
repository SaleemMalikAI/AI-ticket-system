import { CategoryBadge, PriorityBadge } from "@/components/ui/Badge";
import { CATEGORY_GUIDE, PRIORITY_GUIDE } from "@/constants/landing";
import { Anchors } from "@/constants/links";

import { Section } from "./Section";

export function TriageGuide() {
  return (
    <Section
      id={Anchors.TRIAGE}
      eyebrow="Transparent triage"
      title="You can see how the AI decides"
      subtitle="The rules the AI follows are simple and written down, so its suggestions are easy to check."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card sm:p-6">
          <h3 className="font-semibold">Priority</h3>
          <ul className="mt-4 divide-y divide-border">
            {PRIORITY_GUIDE.map(({ priority, text }) => (
              <li key={priority} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <span className="w-24 shrink-0">
                  <PriorityBadge value={priority} />
                </span>
                <span className="text-sm text-muted">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card sm:p-6">
          <h3 className="font-semibold">Category</h3>
          <ul className="mt-4 divide-y divide-border">
            {CATEGORY_GUIDE.map(({ category, text }) => (
              <li key={category} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <span className="w-40 shrink-0">
                  <CategoryBadge value={category} />
                </span>
                <span className="text-sm text-muted">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
