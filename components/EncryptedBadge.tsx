import { Lock } from "lucide-react";
import { cn } from "@/lib/cn";

export function EncryptedBadge({ className, label = "Encrypted" }: { className?: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-ink-900/[0.08] bg-ink-900/[0.03] px-2.5 py-1 text-xs font-medium text-ink-500",
        className,
      )}
    >
      <Lock className="size-3" />
      <span className="encrypted-mask select-none">••••••</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
