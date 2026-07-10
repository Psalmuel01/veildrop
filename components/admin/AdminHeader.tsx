"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { sepolia } from "wagmi/chains";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { WalletButton } from "@/components/WalletButton";
import { BalanceWidget } from "@/components/admin/BalanceWidget";
import { ModeToggle } from "@/components/nav/ModeToggle";
import { useIsZamaReady } from "@/app/providers";
import { cn } from "@/lib/cn";

const NAV_LINKS = [
  { href: "/dashboard", label: "My Drops" },
  { href: "/distribute", label: "New Drop" },
  { href: "/faucet", label: "Faucet" },
];

export function AdminHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { chainId, isConnected } = useAccount();
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
          ? "border-ink-900/[0.06] bg-paper-100/85 backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-0.5">
          <span className="font-display text-lg font-bold tracking-tight text-ink-900">VeilDrop</span>
          <span className="text-lg font-bold text-accent-600">.</span>
        </Link>

        <div className="flex items-center gap-6">
          {isConnected && (
            <nav className="hidden items-center gap-1 sm:flex">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent-600/10 text-accent-600"
                        : "text-ink-700 hover:bg-ink-900/5 hover:text-ink-900",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {isConnected && <ModeToggle className="hidden sm:block" />}

          <div className="flex items-center gap-2">
            {showBalanceControls && (
              <div className="hidden items-center gap-2 sm:flex">
                <BalanceWidget />
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
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-ink-900/[0.05] bg-paper-100/95 backdrop-blur-md sm:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-3">
              {isConnected && NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent-600/10 text-accent-600"
                        : "text-ink-700 hover:bg-ink-900/5",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {isConnected && (
                <>
                  <div className="my-1 border-t border-ink-900/[0.05]" />
                  <ModeToggle className="mx-3" />
                </>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>


    </header>
  );
}
