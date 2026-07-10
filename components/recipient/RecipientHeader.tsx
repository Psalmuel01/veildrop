"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { WalletButton } from "@/components/WalletButton";
import { ModeToggle } from "@/components/nav/ModeToggle";
import { usePendingRecipients } from "@/lib/hooks/usePendingRecipients";
import { cn } from "@/lib/cn";

export function RecipientHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { isConnected } = useAccount();
  const { data: pending } = usePendingRecipients();
  const pendingCount = pending?.length ?? 0;

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
        <Link href="/" className="flex items-center gap-0.5">
          <span className="font-display text-lg font-bold tracking-tight text-ink-900">VeilDrop</span>
          <span className="text-lg font-bold text-accent-600">.</span>
        </Link>

        <div className="flex items-center gap-3">
          {isConnected && (
            <Link
              href="/received"
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/received" || pathname.startsWith("/received/")
                  ? "bg-accent-600/10 text-accent-600"
                  : "text-ink-700 hover:bg-ink-900/5 hover:text-ink-900",
              )}
            >
              Received
              {pendingCount > 0 && (
                <span className="flex size-4 items-center justify-center rounded-full bg-accent-600 text-[10px] font-semibold text-paper-50">
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              )}
            </Link>
          )}
          {isConnected && <ModeToggle />}
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
