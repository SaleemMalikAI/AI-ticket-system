import { BookOpen, FileText, Terminal } from "lucide-react";

import { buttonClasses } from "@/components/ui/Button";
import { ApiRoutes } from "@/constants/api-routes";
import { SAMPLE_TICKET as T } from "@/constants/landing";
import { Anchors, Links } from "@/constants/links";
import { API_URL } from "@/constants/site";

import { Section } from "./Section";

const REQUEST = `curl -X POST ${API_URL}${ApiRoutes.TICKETS} \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "${T.title}",
    "description": "${T.description}"
  }'`;

const RESPONSE = JSON.stringify(
  {
    id: T.id,
    title: T.title,
    status: "open",
    category: T.category,
    priority: T.priority,
    ai_summary: T.ai_summary,
    ai_category: T.category,
    ai_priority: T.priority,
  },
  null,
  2,
);

function CodeBlock({ label, code }: { label: string; code: string }) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-xl [color-scheme:dark]">
      <figcaption className="flex items-center gap-2 border-b border-slate-800 px-4 py-2.5 text-xs font-medium text-slate-400">
        <Terminal className="size-3.5" aria-hidden />
        {label}
      </figcaption>
      {/* wrap long lines instead of horizontal scrolling */}
      <pre className="p-4 text-[13px] leading-relaxed break-words whitespace-pre-wrap text-slate-200">
        <code>{code}</code>
      </pre>
    </figure>
  );
}

export function DeveloperSection() {
  return (
    <Section
      id={Anchors.DEVELOPERS}
      eyebrow="For developers"
      title="One API call, fully triaged"
      subtitle="The app is built on a documented REST API (FastAPI + PostgreSQL). Anything you can do in the UI, you can do over HTTP."
      className="border-y border-border bg-surface/40"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <CodeBlock label="Request" code={REQUEST} />
        <CodeBlock label="Example response" code={RESPONSE} />
      </div>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <a
          href={`${API_URL}/docs`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses("primary")}
        >
          <BookOpen aria-hidden />
          Open API docs
        </a>
        <a href={Links.LLMS} className={buttonClasses("secondary")}>
          <FileText aria-hidden />
          Read llms.txt
        </a>
      </div>
    </Section>
  );
}
