import type { AssistantIntent, DateRange, GroupBy } from "@/types/assistant";

// Mirror backend/app/constants/assistant.py
export const QUESTION_MIN_LENGTH = 3;
export const QUESTION_MAX_LENGTH = 300;
export const DEFAULT_GROUP_BY: GroupBy = "status";

export const SUGGESTED_QUESTIONS = [
  "Show me open urgent tickets",
  "How many billing tickets came in this week?",
  "Break down tickets by category",
  "Summarize the technical issues",
  "Any tickets about refunds?",
] as const;

export const INTENT_LABELS: Record<AssistantIntent, string> = {
  list: "List",
  count: "Count",
  stats: "Breakdown",
  summarize: "Summary",
};

export const DATE_RANGE_LABELS: Record<DateRange, string> = {
  today: "Today",
  last_7_days: "Last 7 days",
  last_30_days: "Last 30 days",
};
