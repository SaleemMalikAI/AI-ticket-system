import type { MetadataRoute } from "next";

import type { Links } from "@/constants/links";

type SitemapEntry = MetadataRoute.Sitemap[number];

export interface PageConfig {
  link: Links;
  title: string;
  description: string;
  /** false = "noindex" meta tag and left out of sitemap.xml / llms.txt */
  indexable: boolean;
  sitemap?: Pick<SitemapEntry, "changeFrequency" | "priority">;
}
