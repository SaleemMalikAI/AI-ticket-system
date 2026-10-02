import Link from "next/link";

import { Links } from "@/constants/links";
import { buildPath } from "@/utilities/url";

/** The AI's answer with "#12"-style citations turned into ticket links. */
export function AnswerText({ text }: { text: string }) {
  return (
    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
      {text.split(/(#\d+)/g).map((part, i) =>
        /^#\d+$/.test(part) ? (
          <Link
            key={i}
            href={buildPath(Links.TICKET_DETAIL, { id: part.slice(1) })}
            className="font-semibold text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary dark:text-indigo-300"
          >
            {part}
          </Link>
        ) : (
          part
        ),
      )}
    </p>
  );
}
