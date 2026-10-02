import { CircleAlert, RotateCcw } from "lucide-react";

import { Button } from "./Button";

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-200"
    >
      <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="flex-1">
        <p className="font-medium">{message}</p>
        {onRetry && (
          <Button variant="secondary" size="sm" className="mt-3" icon={<RotateCcw />} onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}
