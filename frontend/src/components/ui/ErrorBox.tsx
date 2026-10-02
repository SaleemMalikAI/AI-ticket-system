export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-2 font-medium underline">
          Try again
        </button>
      )}
    </div>
  );
}
