import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

const BASE =
  "inline-flex select-none items-center justify-center gap-2 rounded-lg font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-sm shadow-primary/25 hover:bg-primary-hover hover:shadow-md hover:shadow-primary/30",
  secondary: "border border-border bg-surface text-foreground shadow-xs hover:bg-surface-muted",
  danger: "bg-red-600 text-white shadow-sm shadow-red-600/25 hover:bg-red-700",
  ghost: "text-muted hover:bg-surface-muted hover:text-foreground",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
};

/** Same look for <Link> elements: <Link className={buttonClasses("primary")}> */
export const buttonClasses = (variant: Variant = "primary", size: Size = "md", extra = "") =>
  `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${extra}`;

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  className = "",
  disabled,
  children,
  type = "button",
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <LoaderCircle className="animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
}
