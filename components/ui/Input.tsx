import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  mono?: boolean;
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, mono, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-lg border bg-paper-50 px-3.5 text-sm text-ink-900 placeholder:text-ink-500/70",
          "transition-colors focus:outline-none focus:ring-2 focus:ring-accent-600/40",
          error ? "border-error-600 focus:border-error-600" : "border-ink-900/15 focus:border-accent-600",
          mono && "font-mono",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn("text-xs font-medium uppercase tracking-wide text-ink-500", className)}
      {...props}
    />
  );
}
