import {
  Archive,
  ArrowDown,
  ArrowUp,
  ChevronsUp,
  CircleCheck,
  CircleDot,
  CreditCard,
  Inbox,
  Lightbulb,
  Minus,
  Timer,
  UserRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import type { Category, Priority, Status } from "@/types/ticket";

export interface BadgeMeta {
  icon: LucideIcon;
  /** pill colors for light + dark mode */
  className: string;
}

// Tailwind only generates classes it can see as full strings, so they are spelled out
const TONES = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/25",
  amber: "bg-amber-50 text-amber-800 ring-amber-600/25 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/25",
  sky: "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/25",
  slate: "bg-slate-100 text-slate-700 ring-slate-500/20 dark:bg-slate-400/10 dark:text-slate-300 dark:ring-slate-400/25",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-300 dark:ring-blue-400/25",
  orange: "bg-orange-50 text-orange-800 ring-orange-600/25 dark:bg-orange-400/10 dark:text-orange-300 dark:ring-orange-400/25",
  red: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-400/10 dark:text-red-300 dark:ring-red-400/25",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-400/10 dark:text-violet-300 dark:ring-violet-400/25",
} satisfies Record<string, string>;

export const STATUS_META: Record<Status, BadgeMeta> = {
  open: { icon: CircleDot, className: TONES.emerald },
  in_progress: { icon: Timer, className: TONES.amber },
  resolved: { icon: CircleCheck, className: TONES.sky },
  closed: { icon: Archive, className: TONES.slate },
};

export const PRIORITY_META: Record<Priority, BadgeMeta & { stripe: string }> = {
  low: { icon: ArrowDown, className: TONES.slate, stripe: "bg-slate-300 dark:bg-slate-600" },
  medium: { icon: Minus, className: TONES.blue, stripe: "bg-blue-400" },
  high: { icon: ArrowUp, className: TONES.orange, stripe: "bg-orange-500" },
  urgent: { icon: ChevronsUp, className: TONES.red, stripe: "bg-red-500" },
};

export const CATEGORY_META: Record<Category, BadgeMeta> = {
  billing: { icon: CreditCard, className: TONES.violet },
  technical: { icon: Wrench, className: TONES.violet },
  account: { icon: UserRound, className: TONES.violet },
  feature_request: { icon: Lightbulb, className: TONES.violet },
  general: { icon: Inbox, className: TONES.violet },
};
