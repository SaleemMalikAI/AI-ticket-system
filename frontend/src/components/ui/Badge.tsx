import type { ReactNode } from "react";

import { CATEGORY_META, PRIORITY_META, STATUS_META, type BadgeMeta } from "@/constants/ticket-meta";
import type { Category, Priority, Status } from "@/types/ticket";
import { label } from "@/utilities/format";

function Pill({ meta, srPrefix, children }: { meta: BadgeMeta; srPrefix: string; children: ReactNode }) {
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${meta.className}`}
    >
      <Icon className="size-3.5" aria-hidden />
      <span className="sr-only">{srPrefix}: </span>
      {children}
    </span>
  );
}

export const StatusBadge = ({ value }: { value: Status }) => (
  <Pill meta={STATUS_META[value]} srPrefix="Status">{label(value)}</Pill>
);

export const PriorityBadge = ({ value }: { value: Priority }) => (
  <Pill meta={PRIORITY_META[value]} srPrefix="Priority">{label(value)}</Pill>
);

export const CategoryBadge = ({ value }: { value: Category }) => (
  <Pill meta={CATEGORY_META[value]} srPrefix="Category">{label(value)}</Pill>
);
