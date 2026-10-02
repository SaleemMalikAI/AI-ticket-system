import { ArrowUpRight, CircleAlert, RotateCcw, Sparkles } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import type { AskResponse } from "@/types/assistant";
import { buildListLink } from "@/utilities/assistant";

import { AnswerText } from "./AnswerText";
import { SuggestedQuestions } from "./SuggestedQuestions";

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

/** A chat reply: the AI's natural-language answer, nothing else to read through. */
export function AnswerBubble({ response, onPick, disabled }: AnswerProps) {
  const { answer, plan } = response;

  return (
    <AiRow label="AI answer">
      <div className="w-fit max-w-full space-y-3 rounded-2xl rounded-tl-md border border-border bg-surface px-4 py-3 shadow-sm sm:px-5">
        <AnswerText text={answer} />

        {plan ? (
          <Link
            href={buildListLink(plan)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline dark:text-indigo-300"
          >
            View in ticket list
            <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        ) : (
          // the question could not be planned: offer examples that work
          <SuggestedQuestions onPick={onPick} disabled={disabled} className="border-t border-border pt-3" />
        )}
      </div>
    </AiRow>
  );
}
