"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import {
  ArrowRight,
  ArrowDownToLine,
  Bell,
  TrendingUp,
} from "lucide-react";
import { WalletButton } from "@/components/WalletButton";
import { ModeToggle } from "@/components/nav/ModeToggle";
import { usePendingRecipients } from "@/lib/hooks/usePendingRecipients";
import { cn } from "@/lib/cn";

const MODE_META: Record<string, { label: string; color: string; Icon: typeof Bell }> = {
  disperse: { label: "Disperse", color: "text-success-700 bg-success-600/10", Icon: ArrowDownToLine },
  airdrop:  { label: "Airdrop",  color: "text-accent-600 bg-accent-600/10",   Icon: Bell },
  vesting:  { label: "Vesting",  color: "text-amber-600 bg-amber-500/10",     Icon: TrendingUp },
};

export function RecipientHeader() {
  const [scrolled, setScrolled]   = useState(false);
  const [bellOpen, setBellOpen]   = useState(false);
  const bellRef                   = useRef<HTMLDivElement>(null);
  const { isConnected }           = useAccount();
  const { data: pending }         = usePendingRecipients();
  const pendingCount              = pending?.length ?? 0;

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 12); }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close bell on outside click
  useEffect(() => {
    if (!bellOpen) return;
    function onOutside(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [bellOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b transition-all duration-300",
        scrolled
          ? "border-ink-900/[0.06] bg-paper-100/85 backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5 sm:px-8">

        {/* Left: back link + wordmark */}
        <Link href="/" className="flex items-center gap-0.5">
          <span className="font-display text-lg font-bold tracking-tight text-ink-900">VeilDrop</span>
          <span className="text-lg font-bold text-accent-600">.</span>
        </Link>

        {/* Right: bell + mode toggle + wallet */}
        <div className="flex items-center gap-2">

          {isConnected && (
            <div className="relative" ref={bellRef}>
              {/* Bell button */}
              <button
                onClick={() => setBellOpen((o) => !o)}
                aria-label="Notifications"
                className={cn(
                  "relative flex size-9 items-center justify-center rounded-full transition-colors",
                  bellOpen
                    ? "bg-ink-900/8 text-ink-900"
                    : "text-ink-500 hover:bg-ink-900/5 hover:text-ink-900",
                )}
              >
                <Bell className="size-4" />
                {pendingCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-red-500 ring-2 ring-paper-100" />
                )}
              </button>

              {/* Dropdown */}
              {bellOpen && (
                <div className="absolute right-0 z-20 mt-2 w-72 overflow-hidden rounded-xl border border-ink-900/[0.07] bg-paper-50 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.45)]">
                  <div className="border-b border-ink-900/[0.05] px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-400">
                      Notifications
                    </p>
                  </div>

                  {pendingCount === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-ink-500">
                      You&apos;re all caught up.
                    </p>
                  ) : (
                    <>
                      <div className="flex flex-col divide-y divide-ink-900/[0.04]">
                        {pending!.map((item) => {
                          const meta = MODE_META[item.mode] ?? MODE_META.airdrop;
                          const Icon = meta.Icon;
                          const href =
                            item.mode === "vesting"
                              ? `/vesting/${item.id}`
                              : `/claim/${item.id}`;
                          return (
                            <Link
                              key={item.id}
                              href={href}
                              onClick={() => setBellOpen(false)}
                              className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-ink-900/[0.03]"
                            >
                              <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent-600/10 text-accent-600">
                                <Icon className="size-3.5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-ink-900">
                                  {item.title}
                                </p>
                                <p className="mt-0.5 text-xs text-ink-500">
                                  Pending · tap to claim
                                </p>
                              </div>
                              <span className={cn("mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", meta.color)}>
                                {meta.label}
                              </span>
                            </Link>
                          );
                        })}
                      </div>

                      <div className="border-t border-ink-900/[0.05] px-4 py-2.5">
                        <Link
                          href="/received"
                          onClick={() => setBellOpen(false)}
                          className="flex items-center justify-between text-xs font-medium text-accent-600 hover:underline"
                        >
                          View all activity
                          <ArrowRight className="size-3" />
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {isConnected && <ModeToggle />}
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
