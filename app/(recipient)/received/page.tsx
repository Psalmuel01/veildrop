"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import {
  ArrowDownToLine,
  CheckCircle2,
  Clock3,
  Eye,
  ExternalLink,
  Inbox,
  TrendingUp,
  Wallet,
  Lock,
} from "lucide-react";
import { WalletButton } from "@/components/WalletButton";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { BalanceCard } from "@/components/recipient/BalanceCard";
import { getRecipientHistory, type HistoryRecipient } from "@/lib/api";

const SEPOLIA_EXPLORER = "https://sepolia.etherscan.io/tx/";

function truncate(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function RecipientRow({ item }: { item: HistoryRecipient }) {
  const isVesting = item.mode === "vesting";
  const isDisperse = item.mode === "disperse";

  const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const isRevealed = item.revealed || isDisperse;
  const isClaimed = item.claimed || (isVesting && Number(item.totalClaimedAmount ?? 0) > 0);

  const containerClasses =
    "group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-ink-900/[0.06] bg-paper-50 p-4 transition-all duration-200 hover:border-accent-600/40 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]";

  const renderIcon = () => {
    if (isDisperse) {
      return (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success-600/10 text-success-700">
          <ArrowDownToLine className="size-5" />
        </div>
      );
    }
    if (isVesting) {
      return (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
          <TrendingUp className="size-5" />
        </div>
      );
    }
    return (
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-600/10 text-accent-700">
        <ArrowDownToLine className="size-5" />
      </div>
    );
  };

  const renderContent = () => (
    <div className="flex flex-1 items-center gap-3.5 min-w-0">
      {renderIcon()}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-ink-900 group-hover:text-accent-600 transition-colors">
            {item.title}
          </h3>
          <span className="text-xs text-ink-300">•</span>
          <span className="text-xs text-ink-400 font-medium">{dateStr}</span>
        </div>
        <p className="mt-1 font-mono text-xs text-ink-500 truncate">
          From {truncate(item.adminAddress)}
        </p>
      </div>
    </div>
  );

  const renderAmount = () => {
    if (isRevealed) {
      return (
        <div className="flex flex-col items-end shrink-0 text-right">
          <span className="text-sm font-semibold text-ink-900">
            {item.amountDisplay} <span className="text-xs font-medium text-ink-500">{item.tokenSymbol}</span>
          </span>
          {isVesting && item.totalClaimedAmount && (
            <span className="text-[10px] text-ink-400 mt-0.5">
              Claimed: {item.totalClaimedAmount} {item.tokenSymbol}
            </span>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5 rounded-lg border border-ink-900/[0.08] bg-ink-900/[0.02] px-2.5 py-1.5 text-xs font-medium text-ink-500 transition-colors group-hover:bg-accent-600/5 group-hover:border-accent-600/20 group-hover:text-accent-700">
        <Lock className="size-3 text-ink-400 group-hover:text-accent-600" />
        <span className="select-none tracking-wider font-mono">••••••</span>
        {/* <span className="text-[10px] uppercase text-ink-400 font-bold ml-1 group-hover:text-accent-700">Decrypt</span> */}
      </div>
    );
  };

  const renderStatus = () => {
    if (isDisperse) {
      return (
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-success-600/10 px-2.5 py-1 text-[10px] font-semibold text-success-700">
            <CheckCircle2 className="size-3" />
            Received
          </span>
          {item.distributionTxHash && (
            <a
              href={`${SEPOLIA_EXPLORER}${item.distributionTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-400 hover:text-accent-600 transition-colors"
              onClick={(e) => e.stopPropagation()}
              title="View on Etherscan"
            >
              <ExternalLink className="size-3.5" />
            </a>
          )}
        </div>
      );
    }

    if (isVesting) {
      return (
        <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold text-amber-600">
          <TrendingUp className="size-3" />
          {isClaimed ? "Unlocking" : "Vesting"}
        </span>
      );
    }

    // Airdrop
    const isAirdropClaimed = item.claimed;
    return (
      <span
        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
          isAirdropClaimed
            ? "bg-success-600/10 text-success-700"
            : isRevealed
              ? "bg-accent-600/10 text-accent-700"
              : "bg-amber-500/10 text-amber-600"
        }`}
      >
        {isAirdropClaimed ? (
          <>
            <CheckCircle2 className="size-3" />
            Claimed
          </>
        ) : isRevealed ? (
          <>
            <Eye className="size-3" />
            Revealed
          </>
        ) : (
          <>
            <Clock3 className="size-3" />
            Unclaimed
          </>
        )}
      </span>
    );
  };

  const href = isVesting ? `/vesting/${item.id}` : `/claim/${item.id}`;

  if (isDisperse) {
    return (
      <div className={containerClasses}>
        {renderContent()}
        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
          {renderAmount()}
          {renderStatus()}
        </div>
      </div>
    );
  }

  return (
    <Link href={href} className={containerClasses}>
      {renderContent()}
      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
        {renderAmount()}
        {renderStatus()}
      </div>
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
    <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink-900">
          My Allocations<span className="text-accent-600">.</span>
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          Your wallet balance and private allocations in one place. Sealed values require secure cryptographic decryption to view.
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
        <div className="grid gap-8">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink-400">Your balance</p>
            <BalanceCard />
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-400">Recent activity</p>
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
              <div className="flex flex-col gap-3">
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
