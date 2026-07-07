import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { WalletButton } from "@/components/WalletButton";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-900/8 bg-paper-100/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-accent-600" />
          <span className="font-display text-lg font-semibold tracking-tight text-ink-900">
            VeilDrop
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          <Link
            href="/distribute"
            className="rounded-md px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-900/5 hover:text-ink-900"
          >
            Distribute
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-900/5 hover:text-ink-900"
          >
            Dashboard
          </Link>
          <Link
            href="/faucet"
            className="rounded-md px-3 py-2 text-sm font-medium text-ink-500 hover:bg-ink-900/5 hover:text-ink-900"
          >
            Developer · Faucet
          </Link>
        </nav>

        <WalletButton />
      </div>
    </header>
  );
}
