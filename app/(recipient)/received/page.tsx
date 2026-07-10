"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import { ArrowDownToLine, CheckCircle2, Clock3, Eye, ExternalLink, Inbox, TrendingUp, Wallet } from "lucide-react";
import { WalletButton } from "@/components/WalletButton";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { BalanceCard } from "@/components/recipient/BalanceCard";
import { PendingBanner } from "@/components/PendingBanner";
import { getRecipientHistory, type HistoryRecipient } from "@/lib/api";

const SEPOLIA_EXPLORER = "https://sepolia.etherscan.io/tx/";

function truncate(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function RecipientRow({ item }: { item: HistoryRecipient }) {
  if (item.mode === "disperse") {
    // Terminal, nothing to claim in-app, tokens already landed in the
    // wallet. No reveal here either, there's no per-transfer encrypted
    // handle to decrypt without new on-chain event-log lookups, only a link
    // to the transaction itself if we have one.
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-ink-900/[0.06] bg-paper-50 px-3.5 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink-900">{item.title}</p>
          <p className="mt-0.5 font-mono text-[11px] text-ink-500">From {truncate(item.adminAddress)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-success-600/10 px-2 py-0.5 text-[10px] font-semibold text-success-700">
            <ArrowDownToLine className="size-3" />
            Received
          </span>
          {item.distributionTxHash && (
            <a
              href={`${SEPOLIA_EXPLORER}${item.distributionTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-500 hover:text-accent-600"
              aria-label="View transaction"
            >
              <ExternalLink className="size-3.5" />
            </a>
          )}
        </div>
      </div>
    );
  }

  if (item.mode === "vesting") {
    const hasClaimedSomething = !!item.totalClaimedAmount;
    return (
      <Link
        href={`/vesting/${item.id}`}
        className="flex items-center justify-between gap-3 rounded-lg border border-ink-900/[0.06] bg-paper-50 px-3.5 py-2.5 transition-colors hover:border-accent-600/40"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink-900">{item.title}</p>
          <p className="mt-0.5 font-mono text-[11px] text-ink-500">From {truncate(item.adminAddress)}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
          <TrendingUp className="size-3" />
          {hasClaimedSomething ? "Unlocking" : "Vesting"}
        </span>
      </Link>
    );
  }

  const status = !item.claimed ? "unclaimed" : item.revealed ? "revealed" : "claimed";
  return (
    <Link
      href={`/claim/${item.id}`}
      className="flex items-center justify-between gap-3 rounded-lg border border-ink-900/[0.06] bg-paper-50 px-3.5 py-2.5 transition-colors hover:border-accent-600/40"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink-900">{item.title}</p>
        <p className="mt-0.5 font-mono text-[11px] text-ink-500">From {truncate(item.adminAddress)}</p>
      </div>
      <span
        className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
          status === "unclaimed"
            ? "bg-amber-500/10 text-amber-600"
            : status === "claimed"
              ? "bg-accent-600/10 text-accent-600"
              : "bg-success-600/10 text-success-700"
        }`}
      >
        {status === "unclaimed" ? (
          <>
            <Clock3 className="size-3" />
            Unclaimed
          </>
        ) : status === "claimed" ? (
          <>
            <CheckCircle2 className="size-3" />
            Claimed
          </>
        ) : (
          <>
            <Eye className="size-3" />
            Revealed
          </>
        )}
      </span>
    </Link>
  );
}

export default function ReceivedPage() {
  const { address, isConnected } = useAccount();
  const [history, setHistory] = useState<HistoryRecipient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    setIsLoading(true);
    getRecipientHistory(address)
      .then(setHistory)
      .finally(() => setIsLoading(false));
  }, [address]);

  return (
    <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-ink-900">
          Received<span className="text-accent-600">.</span>
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          Your balance and everything sent to this wallet, in one place. Every amount stays sealed
          until you decrypt it yourself.
        </p>
      </div>

      {!isConnected ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <Wallet className="size-8 text-ink-500" />
            <p className="text-sm text-ink-700">Connect your wallet to see what has been sent to you.</p>
            <WalletButton />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <div>
            <p className="mb-2 text-sm font-medium text-ink-900">Your balance</p>
            <BalanceCard />
          </div>

          <PendingBanner />

          <div>
            <p className="mb-2 text-sm font-medium text-ink-900">Recent activity</p>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : history.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
                  <Inbox className="size-8 text-ink-500" />
                  <div>
                    <p className="text-sm font-medium text-ink-900">Nothing here yet</p>
                    <p className="mt-1 text-sm text-ink-500">
                      Distributions sent to this wallet will show up here as soon as they arrive.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col gap-2">
                {history.map((item) => (
                  <RecipientRow key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
