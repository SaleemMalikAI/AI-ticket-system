import type { MetadataRoute } from "next";

import { Links } from "@/constants/links";
import { SITE_URL } from "@/constants/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: Links.HOME },
    sitemap: new URL(Links.SITEMAP, SITE_URL).toString(),
  };
}
