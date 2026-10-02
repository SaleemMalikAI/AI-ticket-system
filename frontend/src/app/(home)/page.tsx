import { Suspense } from "react";

import { TicketListView } from "@/components/tickets/TicketListView";
import { Pages } from "@/constants/pages";
import { buildMetadata } from "@/utilities/seo";

export const metadata = buildMetadata(Pages.HOME);

export default function HomePage() {
  // useSearchParams() in a client component needs a Suspense boundary
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
      <TicketListView />
    </Suspense>
  );
}
