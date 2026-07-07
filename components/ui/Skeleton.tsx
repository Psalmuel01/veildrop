import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gradient-to-r from-ink-900/8 via-ink-900/14 to-ink-900/8 bg-[length:200%_100%]",
        className,
      )}
    />
  );
}
