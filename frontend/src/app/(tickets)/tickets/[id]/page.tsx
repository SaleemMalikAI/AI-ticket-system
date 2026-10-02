import type { Metadata } from "next";

import { TicketDetailView } from "@/components/tickets/TicketDetailView";
import { Links } from "@/constants/links";
import { Pages } from "@/constants/pages";
import { restApi } from "@/rest-api";
import { buildMetadata } from "@/utilities/seo";
import { buildPath } from "@/utilities/url";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const path = buildPath(Links.TICKET_DETAIL, { id });
  try {
    const ticket = await restApi.tickets.get(id);
    return buildMetadata(Pages.TICKET_DETAIL, {
      title: `#${ticket.id} ${ticket.title}`,
      description: ticket.ai_summary ?? ticket.description.slice(0, 160),
      path,
    });
  } catch {
    // backend down or ticket missing: the page itself shows the error
    return buildMetadata(Pages.TICKET_DETAIL, { title: `Ticket #${id}`, path });
  }
}

export default async function TicketDetailPage({ params }: Props) {
  const { id } = await params;
  return <TicketDetailView id={id} />;
}
