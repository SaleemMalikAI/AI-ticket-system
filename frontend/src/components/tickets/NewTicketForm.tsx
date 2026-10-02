"use client";

import { Send, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ErrorBox } from "@/components/ui/ErrorBox";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { Links } from "@/constants/links";
import { MESSAGES } from "@/constants/messages";
import {
  AI_DECIDE_LABEL,
  CATEGORIES,
  DESCRIPTION_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
  PRIORITIES,
  TITLE_MAX_LENGTH,
  TITLE_MIN_LENGTH,
} from "@/constants/ticket";
import { restApi } from "@/rest-api";
import type { Category, Priority } from "@/types/ticket";
import { errorText } from "@/utilities/errors";
import { label } from "@/utilities/format";
import { buildPath } from "@/utilities/url";

type Field = "title" | "description";

function validate(field: Field, value: string): string | null {
  const length = value.trim().length;
  if (field === "title" && length < TITLE_MIN_LENGTH)
    return `Title needs at least ${TITLE_MIN_LENGTH} characters.`;
  if (field === "description" && length < DESCRIPTION_MIN_LENGTH)
    return `Describe the problem in at least ${DESCRIPTION_MIN_LENGTH} characters.`;
  return null;
}

function Counter({ value, max }: { value: string; max: number }) {
  const near = value.length > max * 0.9;
  return (
    <span className={`text-xs tabular-nums ${near ? "text-amber-700 dark:text-amber-300" : "text-muted"}`}>
      {value.length}/{max}
    </span>
  );
}

export function NewTicketForm() {
  const router = useRouter();
  const toast = useToast();
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // "" means "let the AI decide"; any other value overrides the AI
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [touched, setTouched] = useState<Record<Field, boolean>>({ title: false, description: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  // Errors show only after the user leaves a field (or submits)
  const errors: Record<Field, string | null> = {
    title: touched.title ? validate("title", title) : null,
    description: touched.description ? validate("description", description) : null,
  };
  const dirty = Boolean(title.trim() || description.trim());

  async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched({ title: true, description: true });
    // Focus the first invalid field
    if (validate("title", title)) return titleRef.current?.focus();
    if (validate("description", description)) return descriptionRef.current?.focus();

    setSubmitting(true);
    setError(null);
    try {
      const ticket = await restApi.tickets.create({
        title,
        description,
        category: (category || undefined) as Category | undefined,
        priority: (priority || undefined) as Priority | undefined,
      });
      toast({
        tone: "success",
        title: MESSAGES.ticketCreated(ticket.id),
        description: ticket.ai_summary
          ? MESSAGES.aiSuggested(label(ticket.ai_category!), label(ticket.ai_priority!))
          : MESSAGES.aiUnavailable,
      });
      router.push(buildPath(Links.TICKET_DETAIL, { id: ticket.id }));
    } catch (err) {
      setError(errorText(err));
      toast({ tone: "error", title: MESSAGES.createFailed, description: errorText(err) });
      setSubmitting(false);
    }
  }

  function onCancel() {
    if (dirty) setConfirmDiscard(true);
    else router.push(Links.HOME);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="New ticket"
        description="Describe the problem. AI will summarize it and triage it for you."
        back={{ href: Links.HOME, label: "All tickets" }}
      />

      <form onSubmit={onSubmit} noValidate className="card space-y-6 sm:p-7">
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="title" className="label">
              Title <span className="text-red-600 dark:text-red-400" aria-hidden>*</span>
            </label>
            <Counter value={title} max={TITLE_MAX_LENGTH} />
          </div>
          <input
            ref={titleRef}
            id="title"
            className="input h-11"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, title: true }))}
            maxLength={TITLE_MAX_LENGTH}
            required
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "title-error" : undefined}
            disabled={submitting}
            placeholder="e.g. Charged twice for my subscription"
            autoComplete="off"
          />
          {errors.title && (
            <p id="title-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400">
              {errors.title}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="description" className="label">
              Description <span className="text-red-600 dark:text-red-400" aria-hidden>*</span>
            </label>
            <Counter value={description} max={DESCRIPTION_MAX_LENGTH} />
          </div>
          <textarea
            ref={descriptionRef}
            id="description"
            className="input min-h-40 py-2.5 leading-relaxed"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, description: true }))}
            maxLength={DESCRIPTION_MAX_LENGTH}
            required
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? "description-error" : "description-help"}
            disabled={submitting}
            placeholder="What happened, what you expected, and the steps to reproduce…"
          />
          {errors.description ? (
            <p id="description-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400">
              {errors.description}
            </p>
          ) : (
            <p id="description-help" className="mt-1.5 text-xs text-muted">
              More detail gives the AI a better summary and more accurate triage.
            </p>
          )}
        </div>

        <fieldset className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50/60 p-4 dark:border-violet-400/20 dark:from-violet-500/10 dark:to-indigo-500/5">
          <legend className="sr-only">Category and priority</legend>
          <div className="mb-4 flex items-start gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-sm">
              <Sparkles className="size-4" aria-hidden />
            </span>
            <p className="text-sm text-violet-950 dark:text-violet-100">
              AI generates a summary and suggests category and priority. Pick a value to override it;
              you can also change it later on the ticket page.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select id="category" labelText="Category" value={category} options={CATEGORIES} emptyLabel={AI_DECIDE_LABEL} onChange={setCategory} disabled={submitting} />
            <Select id="priority" labelText="Priority" value={priority} options={PRIORITIES} emptyLabel={AI_DECIDE_LABEL} onChange={setPriority} disabled={submitting} />
          </div>
        </fieldset>

        {error && <ErrorBox message={error} />}

        <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting} icon={<Send />}>
            {submitting ? "AI is analyzing…" : "Create ticket"}
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={confirmDiscard}
        tone="danger"
        title={MESSAGES.confirmDiscardTitle}
        description={MESSAGES.confirmDiscardBody}
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        onConfirm={() => router.push(Links.HOME)}
        onCancel={() => setConfirmDiscard(false)}
      />
    </div>
  );
}
