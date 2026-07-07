"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { sepolia } from "wagmi/chains";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Plus } from "lucide-react";
import { WalletButton } from "@/components/WalletButton";
import { BalanceWidget } from "@/components/admin/BalanceWidget";
import { MintModal } from "@/components/admin/MintModal";
import { useIsZamaReady } from "@/app/providers";
import { cn } from "@/lib/cn";

const NAV_LINKS = [
  { href: "/distribute", label: "New Drop" },
  { href: "/dashboard", label: "My Drops" },
  { href: "/docs", label: "Docs" },
  { href: "/faucet", label: "Faucet" },
];

export function AdminHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mintOpen, setMintOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { chainId } = useAccount();
  const isSepolia = chainId === sepolia.id;
  const isZamaReady = useIsZamaReady();
  const showBalanceControls = isSepolia && isZamaReady;

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
          ? "border-ink-900/10 bg-paper-100/85 backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-0.5">
          <span className="font-display text-lg font-bold tracking-tight text-ink-900">VeilDrop</span>
          <span className="text-lg font-bold text-accent-600">.</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-900/5 hover:text-ink-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {showBalanceControls && (
            <div className="hidden items-center gap-2 sm:flex">
              <BalanceWidget />
              <button
                onClick={() => setMintOpen(true)}
                className="flex size-9 items-center justify-center rounded-full border border-ink-900/15 bg-paper-50 text-ink-700 transition-colors hover:border-accent-600/40 hover:text-accent-600"
                aria-label="Mint test tokens"
                title="Mint test tokens"
              >
                <Plus className="size-4" />
              </button>
            </div>
          )}
          <WalletButton />
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex size-9 items-center justify-center rounded-full text-ink-700 hover:bg-ink-900/5 sm:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-ink-900/8 bg-paper-100/95 backdrop-blur-md sm:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-900/5"
                >
                  {link.label}
                </Link>
              ))}
              {showBalanceControls && (
                <button
                  onClick={() => {
                    setMintOpen(true);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-accent-600 hover:bg-ink-900/5"
                >
                  <Plus className="size-4" />
                  Mint test tokens
                </button>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <MintModal open={mintOpen} onClose={() => setMintOpen(false)} />
    </header>
  );
}
