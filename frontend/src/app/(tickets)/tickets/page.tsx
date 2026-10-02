import { Suspense } from "react";

import { TicketListSkeleton } from "@/components/tickets/TicketListSkeleton";
import { TicketListView } from "@/components/tickets/TicketListView";
import { Pages } from "@/constants/pages";
import { buildMetadata } from "@/utilities/seo";

export const metadata = buildMetadata(Pages.TICKETS);

export default function TicketsPage() {
  // useSearchParams() in a client component needs a Suspense boundary
  return (
    <Suspense fallback={<TicketListSkeleton />}>
      <TicketListView />
    </Suspense>
  );
}
