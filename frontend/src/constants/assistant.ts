// Mirror backend/app/constants/assistant.py
export const QUESTION_MIN_LENGTH = 3;
export const QUESTION_MAX_LENGTH = 300;

export const SUGGESTED_QUESTIONS = [
  "Show me open urgent tickets",
  "How many billing tickets came in this week?",
  "Break down tickets by category",
  "Summarize the technical issues",
  "Any tickets about refunds?",
] as const;
