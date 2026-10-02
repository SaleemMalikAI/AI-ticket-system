import { Compass } from "lucide-react";
import Link from "next/link";

import { buttonClasses } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Links } from "@/constants/links";
import { PAGES, Pages } from "@/constants/pages";
import { buildMetadata } from "@/utilities/seo";

export const metadata = buildMetadata(Pages.NOT_FOUND);

export default function NotFound() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <EmptyState
        icon={Compass}
        title={PAGES[Pages.NOT_FOUND].title}
        description={PAGES[Pages.NOT_FOUND].description}
        action={
          <Link href={Links.TICKETS} className={buttonClasses("secondary")}>
            Back to tickets
          </Link>
        }
      />
    </main>
  );
}
