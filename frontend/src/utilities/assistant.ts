import { DATE_RANGE_LABELS, INTENT_LABELS } from "@/constants/assistant";
import { Links } from "@/constants/links";
import type { QueryPlan } from "@/types/assistant";

import { label } from "./format";
import { withQuery } from "./url";

/** The same filters on the ticket list page (date range is not a list filter). */
export const buildListLink = (plan: QueryPlan) =>
  withQuery(Links.TICKETS, {
    status: plan.status,
    category: plan.category,
    priority: plan.priority,
    q: plan.q,
  });

/** "Filters used" chips: [{ name: "Status", value: "Open" }, ...] */
export function planChips(plan: QueryPlan): { name: string; value: string }[] {
  const chips = [{ name: "Intent", value: INTENT_LABELS[plan.intent] }];
  if (plan.status) chips.push({ name: "Status", value: label(plan.status) });
  if (plan.category) chips.push({ name: "Category", value: label(plan.category) });
  if (plan.priority) chips.push({ name: "Priority", value: label(plan.priority) });
  if (plan.q) chips.push({ name: "Search", value: `“${plan.q}”` });
  if (plan.date_range) chips.push({ name: "Date", value: DATE_RANGE_LABELS[plan.date_range] });
  if (plan.group_by) chips.push({ name: "Group by", value: label(plan.group_by) });
  return chips;
}
