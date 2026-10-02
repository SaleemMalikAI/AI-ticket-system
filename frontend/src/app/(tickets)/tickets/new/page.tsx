import { NewTicketForm } from "@/components/tickets/NewTicketForm";
import { Pages } from "@/constants/pages";
import { buildMetadata } from "@/utilities/seo";

export const metadata = buildMetadata(Pages.NEW_TICKET);

export default function NewTicketPage() {
  return <NewTicketForm />;
}
