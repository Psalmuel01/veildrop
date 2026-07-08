"use client";

import Link from "next/link";
import { WalletButton } from "@/components/WalletButton";

export function RecipientHeader() {
  return (
    <header className="border-b border-ink-900/[0.05] bg-paper-100">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-0.5">
          <span className="font-display text-lg font-bold tracking-tight text-ink-900">VeilDrop</span>
          <span className="text-lg font-bold text-accent-600">.</span>
        </Link>
        <WalletButton />
      </div>
    </header>
  );
}
