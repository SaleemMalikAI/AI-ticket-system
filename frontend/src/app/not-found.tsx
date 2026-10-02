import Link from "next/link";

import { Links } from "@/constants/links";
import { PAGES, Pages } from "@/constants/pages";
import { buildMetadata } from "@/utilities/seo";

export const metadata = buildMetadata(Pages.NOT_FOUND);

export default function NotFound() {
  return (
    <div className="card text-center">
      <h1 className="text-lg font-semibold">{PAGES[Pages.NOT_FOUND].title}</h1>
      <p className="mt-1 text-sm text-slate-500">{PAGES[Pages.NOT_FOUND].description}</p>
      <Link href={Links.HOME} className="mt-3 inline-block text-sm underline">
        Back to tickets
      </Link>
    </div>
  );
}
