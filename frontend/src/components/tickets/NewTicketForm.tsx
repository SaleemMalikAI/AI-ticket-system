"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ErrorBox } from "@/components/ui/ErrorBox";
import { Select } from "@/components/ui/Select";
import { Links } from "@/constants/links";
import { AI_DECIDE_LABEL, CATEGORIES, PRIORITIES } from "@/constants/ticket";
import { restApi } from "@/rest-api";
import type { Category, Priority } from "@/types/ticket";
import { errorText } from "@/utilities/errors";
import { buildPath } from "@/utilities/url";

export function NewTicketForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // "" means "let the AI decide"; any other value overrides the AI
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const ticket = await restApi.tickets.create({
        title,
        description,
        category: (category || undefined) as Category | undefined,
        priority: (priority || undefined) as Priority | undefined,
      });
      router.push(buildPath(Links.TICKET_DETAIL, { id: ticket.id }));
    } catch (err) {
      setError(errorText(err));
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">New ticket</h1>

      <form onSubmit={onSubmit} className="card space-y-4">
        <div>
          <label htmlFor="title" className="mb-1 block text-xs font-medium text-slate-600">
            Title
          </label>
          <input
            id="title"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            minLength={3}
            maxLength={200}
            required
            disabled={submitting}
            placeholder="Short description of the problem"
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-xs font-medium text-slate-600">
            Description
          </label>
          <textarea
            id="description"
            className="input min-h-36"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            minLength={10}
            maxLength={5000}
            required
            disabled={submitting}
            placeholder="What happened, what you expected, steps to reproduce…"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select id="category" labelText="Category" value={category} options={CATEGORIES} emptyLabel={AI_DECIDE_LABEL} onChange={setCategory} disabled={submitting} />
          <Select id="priority" labelText="Priority" value={priority} options={PRIORITIES} emptyLabel={AI_DECIDE_LABEL} onChange={setPriority} disabled={submitting} />
        </div>
        <p className="text-xs text-slate-500">
          AI generates a summary and suggests category and priority. Pick a value to override it;
          you can also change it later on the ticket page.
        </p>

        {error && <ErrorBox message={error} />}

        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={() => router.back()} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Analyzing & creating…" : "Create ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}
