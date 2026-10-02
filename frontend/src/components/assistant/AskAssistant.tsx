"use client";

import { SendHorizontal, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { QUESTION_MAX_LENGTH, QUESTION_MIN_LENGTH } from "@/constants/assistant";
import { PAGES, Pages } from "@/constants/pages";
import { restApi } from "@/rest-api";
import type { AskResponse } from "@/types/assistant";
import { errorText } from "@/utilities/errors";

import { AnswerBubble, ErrorBubble, ThinkingBubble, UserBubble } from "./ChatBubbles";
import { SuggestedQuestions } from "./SuggestedQuestions";

type ChatMessage =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "assistant"; response: AskResponse }
  | { id: number; role: "error"; text: string; question: string };

/** Chat with the ticket assistant. History lives in React state only. */
export function AskAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const nextId = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view
  useEffect(() => {
    if (messages.length === 0 && !loading) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    endRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "end" });
  }, [messages, loading]);

  async function ask(question: string, retryOf?: number) {
    const text = question.trim();
    if (text.length < QUESTION_MIN_LENGTH || loading) return;

    setMessages((all) =>
      retryOf === undefined
        ? [...all, { id: nextId.current++, role: "user", text }]
        : all.filter((m) => m.id !== retryOf), // retry: drop the error bubble, keep the question
    );
    setInput("");
    setLoading(true);
    try {
      const response = await restApi.assistant.ask(text);
      setMessages((all) => [...all, { id: nextId.current++, role: "assistant", response }]);
    } catch (e) {
      setMessages((all) => [...all, { id: nextId.current++, role: "error", text: errorText(e), question: text }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  const tooShort = input.trim().length < QUESTION_MIN_LENGTH;

  return (
    <div className="flex min-h-[calc(100dvh-12rem)] flex-col gap-6">
      <PageHeader
        title={
          <span className="inline-flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md shadow-indigo-500/30">
              <Sparkles className="size-5" aria-hidden />
            </span>
            {PAGES[Pages.ASK].title}
          </span>
        }
        description="Ask about your tickets in plain English, or ask it to create one. The AI never touches the database directly: it turns questions into filters and drafts tickets for you to confirm."
      />

      {messages.length === 0 && !loading ? (
        <div className="card flex flex-1 animate-fade-in flex-col items-center justify-center px-6 py-12 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/15 to-indigo-500/15 text-primary dark:text-indigo-300">
            <Sparkles className="size-7" aria-hidden />
          </span>
          <h2 className="mt-4 text-lg font-semibold">What would you like to know?</h2>
          <p className="mt-1 max-w-md text-sm text-muted">
            List, count, break down or summarize tickets, or describe a problem to create a new one. Try:
          </p>
          <SuggestedQuestions onPick={ask} disabled={loading} className="mt-6 justify-center" />
        </div>
      ) : (
        <ol role="log" aria-live="polite" aria-label="Conversation" className="flex-1 space-y-5">
          {messages.map((m) => {
            if (m.role === "user") return <UserBubble key={m.id} text={m.text} />;
            if (m.role === "error")
              return (
                <ErrorBubble key={m.id} message={m.text} disabled={loading} onRetry={() => ask(m.question, m.id)} />
              );
            return <AnswerBubble key={m.id} response={m.response} onPick={ask} disabled={loading} />;
          })}
          {loading && <ThinkingBubble />}
        </ol>
      )}
      {/* scroll target; the margin keeps new messages clear of the sticky input */}
      <div ref={endRef} className="scroll-mb-28" />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="sticky bottom-4 z-10 flex items-center gap-2 rounded-2xl border border-border bg-surface/90 p-2 shadow-lg backdrop-blur"
      >
        <label htmlFor="ask-input" className="sr-only">
          Ask a question about your tickets
        </label>
        <input
          ref={inputRef}
          id="ask-input"
          className="h-11 min-w-0 flex-1 bg-transparent px-3 text-base outline-none placeholder:text-muted/70 disabled:opacity-60 sm:text-sm"
          placeholder={loading ? "Thinking…" : "e.g. How many urgent billing tickets are open?"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={QUESTION_MAX_LENGTH}
          disabled={loading}
          autoComplete="off"
          autoFocus
        />
        <Button type="submit" disabled={tooShort} loading={loading} icon={<SendHorizontal />} aria-label="Send">
          <span className="hidden sm:inline">Send</span>
        </Button>
      </form>
    </div>
  );
}
