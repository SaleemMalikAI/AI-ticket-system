import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface Props {
  title: ReactNode;
  description?: ReactNode;
  back?: { href: string; label: string };
  actions?: ReactNode;
}

export function PageHeader({ title, description, back, actions }: Props) {
  return (
    <div className="space-y-3">
      {back && (
        <Link
          href={back.href}
          className="group inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted transition hover:text-foreground"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">{title}</h1>
          {description && <div className="mt-1.5 text-sm text-muted">{description}</div>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}
