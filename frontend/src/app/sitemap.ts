import type { MetadataRoute } from "next";

import { PAGES } from "@/constants/pages";
import { SITE_URL } from "@/constants/site";

// Generated from PAGES: only indexable pages with a sitemap config are listed
export default function sitemap(): MetadataRoute.Sitemap {
  return Object.values(PAGES)
    .filter((page) => page.indexable && page.sitemap)
    .map((page) => ({
      url: new URL(page.link, SITE_URL).toString(),
      lastModified: new Date(),
      ...page.sitemap,
    }));
}
