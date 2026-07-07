"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-accent-600 text-paper-100 hover:bg-accent-300 active:bg-accent-700 disabled:bg-ink-300 disabled:text-paper-50",
  secondary:
    "bg-transparent text-ink-900 border border-ink-900/25 hover:border-ink-900/50 hover:bg-ink-900/5 active:bg-ink-900/10",
  ghost: "bg-transparent text-ink-700 hover:bg-ink-900/5 active:bg-ink-900/10",
  danger: "bg-error-600 text-paper-100 hover:bg-error-700 active:bg-error-700 disabled:bg-ink-300",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3.5 text-sm rounded-full gap-1.5",
  md: "h-10 px-5 text-sm rounded-full gap-2",
  lg: "h-12 px-6 text-base rounded-full gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-bold tracking-tight transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2 focus-visible:ring-offset-paper-100",
          "disabled:cursor-not-allowed disabled:opacity-60",
          "active:scale-[0.98]",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {isLoading && <Loader2 className="size-4 animate-spin" />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
