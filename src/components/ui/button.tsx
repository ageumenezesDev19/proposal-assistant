import { ComponentProps } from "react";

type Variant = "primary" | "quiet";

interface ButtonProps extends ComponentProps<"button"> {
  variant?: Variant;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-md px-4 min-h-11 " +
  "text-sm font-medium transition-colors disabled:opacity-50 " +
  "disabled:pointer-events-none border";

const variants: Record<Variant, string> = {
  primary: "bg-moss text-paper border-moss hover:bg-moss-hover",
  quiet: "bg-transparent text-ink border-rule hover:border-ink-soft",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
