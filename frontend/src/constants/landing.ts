import {
  FileText,
  Gauge,
  ListFilter,
  PencilLine,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Tags,
  UserCheck,
  type LucideIcon,
} from "lucide-react";

import type { Category, Priority } from "@/types/ticket";

import { Anchors } from "./links";

interface IconItem {
  icon: LucideIcon;
  title: string;
  text: string;
}

export const HERO = {
  eyebrow: "AI-powered ticket triage",
  titleLead: "Support tickets,",
  titleHighlight: "triaged by AI",
  titleTail: "in seconds.",
  subtitle:
    "Describe the problem in plain words. AI writes a one-line summary and suggests the category and priority, and your team always has the final say.",
  highlights: ["Summary, category and priority", "Override anything", "REST API included"],
} as const;

/** In-page navigation shown in the header on the landing page. */
export const LANDING_NAV: { label: string; anchor: Anchors }[] = [
  { label: "How it works", anchor: Anchors.HOW_IT_WORKS },
  { label: "Features", anchor: Anchors.FEATURES },
  { label: "Developers", anchor: Anchors.DEVELOPERS },
  { label: "FAQ", anchor: Anchors.FAQ },
];

export const HOW_IT_WORKS: IconItem[] = [
  {
    icon: PencilLine,
    title: "Describe the problem",
    text: "Write a title and what happened. No forms full of dropdowns to fill in first.",
  },
  {
    icon: Sparkles,
    title: "AI triages it",
    text: "The AI reads the ticket and returns a short summary, a category and a priority.",
  },
  {
    icon: SlidersHorizontal,
    title: "You stay in control",
    text: "Accept the suggestion or override it, then track the ticket from open to closed.",
  },
];

export const FEATURES: IconItem[] = [
  {
    icon: FileText,
    title: "One-line AI summaries",
    text: "Every ticket gets a short summary, so the whole queue can be scanned at a glance.",
  },
  {
    icon: Tags,
    title: "Automatic categorization",
    text: "Billing, technical, account, feature request or general, picked from the ticket text.",
  },
  {
    icon: Gauge,
    title: "Priority detection",
    text: "Outages and payment failures are flagged as urgent, while questions stay low.",
  },
  {
    icon: UserCheck,
    title: "Human override",
    text: "Pick your own category or priority at any time. The AI's suggestion is kept, so overrides stay visible.",
  },
  {
    icon: ListFilter,
    title: "Filter and track",
    text: "Filter by status, category and priority. Filters live in the URL, so every view can be shared.",
  },
  {
    icon: ShieldCheck,
    title: "Works even when AI doesn't",
    text: "If the AI is slow or unavailable, the ticket is still created with sensible defaults. Nothing is lost.",
  },
];

/** Mirrors the priority guide in the backend prompt (backend/app/constants/ai.py). */
export const PRIORITY_GUIDE: { priority: Priority; text: string }[] = [
  { priority: "urgent", text: "Outage, data loss, security or payment failure for many users" },
  { priority: "high", text: "A core feature is broken for this user" },
  { priority: "medium", text: "A degraded or partial issue" },
  { priority: "low", text: "A question, cosmetic issue or feature request" },
];

export const CATEGORY_GUIDE: { category: Category; text: string }[] = [
  { category: "billing", text: "Charges, refunds, invoices, plans" },
  { category: "technical", text: "Bugs, errors, crashes, outages" },
  { category: "account", text: "Login, access, profile, security" },
  { category: "feature_request", text: "Ideas and improvements" },
  { category: "general", text: "Everything else" },
];

/** A sample ticket for the hero preview (illustrative, not live data). */
export const SAMPLE_TICKET = {
  id: 128,
  title: "Charged twice for the Pro plan",
  description:
    "My card was charged twice for the Pro plan this month. Please refund one of the charges.",
  ai_summary: "Customer was double-charged for the Pro plan and wants one charge refunded.",
  category: "billing" as Category,
  priority: "high" as Priority,
};

export const FAQ: { question: string; answer: string }[] = [
  {
    question: "What exactly does the AI do?",
    answer:
      "When a ticket is created, the AI reads the title and description and returns a one-sentence summary plus a suggested category and priority. Nothing else about the ticket is changed.",
  },
  {
    question: "Can I change what the AI picked?",
    answer:
      "Yes. Choose a category or priority when you create the ticket to override the AI, or change them later on the ticket page. The original AI suggestion is kept and marked as overridden.",
  },
  {
    question: "What happens if the AI is down or slow?",
    answer:
      "The ticket is still created. It gets the default category (General) and priority (Medium), and the ticket page says that AI analysis was unavailable.",
  },
  {
    question: "Which AI model is used?",
    answer:
      "Any OpenAI-compatible chat API works. By default it runs on Groq with the openai/gpt-oss-20b model, and it can be changed with the LLM_MODEL setting.",
  },
  {
    question: "Is there an API?",
    answer:
      "Yes. Everything the app does goes through a documented REST API (FastAPI), with interactive docs at /docs on the backend.",
  },
];
