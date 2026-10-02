import { Links } from "@/constants/links";
import type { QueryPlan } from "@/types/assistant";

import { withQuery } from "./url";

/** The same filters on the ticket list page (date range is not a list filter). */
export const buildListLink = (plan: QueryPlan) =>
  withQuery(Links.TICKETS, {
    status: plan.status,
    category: plan.category,
    priority: plan.priority,
    q: plan.q,
  });
