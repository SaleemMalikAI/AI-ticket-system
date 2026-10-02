import { ApiRoutes } from "@/constants/api-routes";
import { PAGES } from "@/constants/pages";
import { API_URL, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/constants/site";

export const dynamic = "force-static";

// llms.txt (https://llmstxt.org): a Markdown overview of the site for LLMs,
// generated from the same PAGES / ApiRoutes constants as the app.
export function GET() {
  const pages = Object.values(PAGES)
    .filter((page) => page.indexable)
    .map((page) => `- [${page.title}](${new URL(page.link, SITE_URL)}): ${page.description}`);

  const api = Object.entries(ApiRoutes).map(([name, path]) => `- ${name}: ${API_URL}${path}`);

  const body = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}. Each new ticket gets an AI summary plus a suggested category and priority, which a person can override.`,
    "",
    "## Pages",
    ...pages,
    "",
    "## API",
    `- Docs: ${API_URL}/docs`,
    ...api,
    "",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
