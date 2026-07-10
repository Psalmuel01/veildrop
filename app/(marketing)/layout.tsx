import Link from "next/link";
import { BookOpen } from "lucide-react";
import { WalletButton } from "@/components/WalletButton";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper-100">
      <header className="border-b border-ink-900/[0.05] bg-paper-100">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-0.5">
            <span className="font-display text-lg font-bold tracking-tight text-ink-900">VeilDrop</span>
            <span className="text-lg font-bold text-accent-600">.</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/docs"
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-900/5 hover:text-ink-900"
            >
              <BookOpen className="size-4 text-ink-500" />
              Docs
            </Link>
            <WalletButton />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
