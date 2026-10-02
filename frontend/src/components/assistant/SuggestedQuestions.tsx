import { SUGGESTED_QUESTIONS } from "@/constants/assistant";

interface Props {
  onPick: (question: string) => void;
  disabled?: boolean;
  className?: string;
}

export function SuggestedQuestions({ onPick, disabled, className = "" }: Props) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`} aria-label="Suggested questions">
      {SUGGESTED_QUESTIONS.map((q) => (
        <li key={q}>
          <button
            type="button"
            onClick={() => onPick(q)}
            disabled={disabled}
            className="rounded-full border border-border bg-surface px-3.5 py-2 text-sm font-medium text-foreground shadow-xs transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary disabled:opacity-50 dark:hover:text-indigo-300"
          >
            {q}
          </button>
        </li>
      ))}
    </ul>
  );
}
