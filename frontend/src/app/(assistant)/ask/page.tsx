import { AskAssistant } from "@/components/assistant/AskAssistant";
import { Pages } from "@/constants/pages";
import { buildMetadata } from "@/utilities/seo";

export const metadata = buildMetadata(Pages.ASK);

export default function AskPage() {
  return <AskAssistant />;
}
