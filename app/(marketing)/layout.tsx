import Link from "next/link";
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
          <WalletButton />
        </div>
      </header>
      {children}
    </div>
  );
}
