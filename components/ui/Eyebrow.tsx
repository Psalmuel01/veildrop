import { cn } from "@/lib/cn";

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent-600",
        className,
      )}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-accent-600" />
      {children}
    </p>
  );
}
