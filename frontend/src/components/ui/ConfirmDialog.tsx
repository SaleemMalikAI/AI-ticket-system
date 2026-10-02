"use client";

import { PencilLine, TriangleAlert } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

import { Button } from "./Button";

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** "danger" for destructive actions (red button + warning icon) */
  tone?: "primary" | "danger";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}

/**
 * Modal "are you sure?" dialog built on native <dialog>, which gives focus
 * trapping, Esc to close and a backdrop for free. Focus starts on Cancel.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "primary",
  loading = false,
  onConfirm,
  onCancel,
  children,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const cancel = () => {
    if (!loading) onCancel();
  };

  const Icon = tone === "danger" ? TriangleAlert : PencilLine;
  const iconTone =
    tone === "danger"
      ? "bg-red-100 text-red-600 dark:bg-red-400/15 dark:text-red-300"
      : "bg-primary/10 text-primary dark:text-indigo-300";

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={descId}
      onCancel={(e) => {
        e.preventDefault(); // Esc: let the parent decide (and block while saving)
        cancel();
      }}
      onClick={(e) => {
        if (e.target === ref.current) cancel(); // click on the backdrop
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-2xl border border-border bg-surface p-0 text-foreground shadow-2xl open:animate-scale-in"
    >
      <div className="flex gap-4 p-6">
        <span className={`grid size-10 shrink-0 place-items-center rounded-full ${iconTone}`}>
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="text-base font-semibold">
            {title}
          </h2>
          <p id={descId} className="mt-1 text-sm text-muted">
            {description}
          </p>
          {children && <div className="mt-3">{children}</div>}
        </div>
      </div>
      <div className="flex flex-col-reverse gap-2 border-t border-border bg-surface-muted/60 px-6 py-4 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={cancel} disabled={loading} autoFocus>
          {cancelLabel}
        </Button>
        <Button variant={tone} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
