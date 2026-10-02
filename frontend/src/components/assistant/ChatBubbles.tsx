import { ArrowUpRight, CircleAlert, RotateCcw, Sparkles } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import type { AskResponse } from "@/types/assistant";
import { buildListLink } from "@/utilities/assistant";

import { AnswerText } from "./AnswerText";
import { PlanChips } from "./PlanChips";
import { StatsBadges } from "./StatsBadges";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { TicketMiniCard } from "./TicketMiniCard";

function AiAvatar() {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-sm">
      <Sparkles className="size-4" aria-hidden />
    </span>
  );
}

function AiRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <li className="flex animate-fade-in items-start gap-3" aria-label={label}>
      <AiAvatar />
      <div className="min-w-0 flex-1">{children}</div>
    </li>
  );
}

export function UserBubble({ text }: { text: string }) {
  return (
    <li className="flex animate-fade-in justify-end" aria-label="You asked">
      <p className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-[15px] leading-relaxed text-primary-foreground shadow-sm shadow-primary/20">
        {text}
      </p>
    </li>
  );
}

export function ThinkingBubble() {
  return (
    <AiRow label="AI is thinking">
      <div className="inline-flex items-center gap-2 rounded-2xl rounded-tl-md border border-border bg-surface px-4 py-3 text-sm text-muted">
        <span className="flex gap-1" aria-hidden>
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="size-1.5 animate-bounce rounded-full bg-primary/70"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </span>
        Thinking…
      </div>
    </AiRow>
  );
}

export function ErrorBubble({ message, onRetry, disabled }: { message: string; onRetry: () => void; disabled: boolean }) {
  return (
    <AiRow label="Error">
      <div
        role="alert"
        className="rounded-2xl rounded-tl-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-200"
      >
        <p className="flex items-start gap-2 font-medium">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {message}
        </p>
        <Button variant="secondary" size="sm" className="mt-3" icon={<RotateCcw />} onClick={onRetry} disabled={disabled}>
          Retry
        </Button>
      </div>
    </AiRow>
  );
}

interface AnswerProps {
  response: AskResponse;
  onPick: (question: string) => void;
  disabled: boolean;
}

export function AnswerBubble({ response, onPick, disabled }: AnswerProps) {
  const { answer, plan, tickets, stats } = response;

  return (
    <AiRow label="AI answer">
      <div className="space-y-4 rounded-2xl rounded-tl-md border border-border bg-surface px-4 py-3.5 shadow-sm sm:px-5">
        <AnswerText text={answer} />

        {stats && Object.keys(stats).length > 0 && <StatsBadges stats={stats} groupBy={plan?.group_by ?? null} />}

        {tickets.length > 0 && (
          <ul className="space-y-2">
            {tickets.map((t) => (
              <li key={t.id}>
                <TicketMiniCard ticket={t} />
              </li>
            ))}
          </ul>
        )}

        {plan ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
            <PlanChips plan={plan} />
            <Link
              href={buildListLink(plan)}
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline dark:text-indigo-300"
            >
              Open in list view
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>
        ) : (
          // the question could not be planned: offer examples that work
          <SuggestedQuestions onPick={onPick} disabled={disabled} className="border-t border-border pt-3" />
        )}
      </div>
    </AiRow>
  );
}
