"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronDown, LayoutDashboard, Wallet2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { useModePreference, type Mode } from "@/lib/hooks/useModePreference";

const ADMIN_PREFIXES = ["/dashboard", "/distribute", "/faucet", "/docs"];
const RECIPIENT_PREFIXES = ["/claim", "/received", "/vesting"];

const MODE_META: Record<Mode, { label: string; icon: typeof LayoutDashboard; href: string }> = {
  admin: { label: "Admin", icon: LayoutDashboard, href: "/dashboard" },
  recipient: { label: "Recipient", icon: Wallet2, href: "/received" },
};

function activeMode(pathname: string): Mode | null {
  if (ADMIN_PREFIXES.some((p) => pathname.startsWith(p))) return "admin";
  if (RECIPIENT_PREFIXES.some((p) => pathname.startsWith(p))) return "recipient";
  return null;
}

export function ModeToggle({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setMode } = useModePreference();
  const active = activeMode(pathname);
  const [open, setOpen] = useState(false);

  // Neither section active (shouldn't happen wherever this renders, but
  // fall back to admin as the visible label rather than rendering nothing).
  const current = MODE_META[active ?? "admin"];

  function go(mode: Mode) {
    setOpen(false);
    if (mode === active) return;
    setMode(mode);
    router.push(MODE_META[mode].href);
  }

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ink-900/[0.08] bg-paper-100 px-3 text-xs font-medium text-ink-700 transition-colors hover:border-ink-900/[0.22]"
      >
        <current.icon className="size-3.5" />
        {current.label}
        <ChevronDown className={cn("size-3.5 text-ink-500 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-lg border border-ink-900/[0.06] bg-paper-50 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.5)]">
            {(Object.keys(MODE_META) as Mode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => go(mode)}
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-sm text-ink-700 hover:bg-ink-900/5"
              >
                {(() => {
                  const Icon = MODE_META[mode].icon;
                  return <Icon className="size-3.5" />;
                })()}
                <span className="flex-1 text-left">{MODE_META[mode].label}</span>
                {mode === active && <Check className="size-3.5 text-accent-600" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
