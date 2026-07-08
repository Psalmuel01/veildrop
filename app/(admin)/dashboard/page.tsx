"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { sepolia } from "wagmi/chains";
import { Inbox, Wallet, AlertTriangle, ArrowUpRight, Send, Gift } from "lucide-react";
import { WalletButton } from "@/components/WalletButton";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EncryptedBadge } from "@/components/EncryptedBadge";
import { loadDistributions, type StoredDistribution } from "@/lib/distributions";

function timeAgo(ts: number): string {
  const diffMinutes = Math.floor((Date.now() - ts) / 60_000);
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function DistributionCard({ distribution }: { distribution: StoredDistribution }) {
  const Icon = distribution.mode === "disperse" ? Send : Gift;
  return (
    <Link
      href={`/dashboard/${distribution.id}`}
      className="flex items-center justify-between gap-4 rounded-xl border border-ink-900/[0.06] bg-paper-50 p-4 transition-all hover:-translate-y-0.5 hover:border-accent-600/40 hover:shadow-[0_12px_30px_-12px_rgba(0,0,0,0.4)]"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-ink-900/5 text-ink-700">
          <Icon className="size-4" />
        </div>
        <div>
          <p className="font-display text-base font-bold text-ink-900">{distribution.title}</p>
          <p className="text-xs text-ink-500">
            {distribution.recipientCount} recipients, {distribution.mode}, {timeAgo(distribution.createdAt)}
          </p>
        </div>
      </div>
      <EncryptedBadge />
    </Link>
  );
}

export default function DashboardPage() {
  const { address, isConnected, chainId } = useAccount();
  const isSepolia = chainId === sepolia.id;
  const [distributions, setDistributions] = useState<StoredDistribution[]>([]);

  useEffect(() => {
    if (address) setDistributions(loadDistributions(address));
  }, [address]);

  return (
    <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900">My Drops</h1>
          <p className="mt-1 text-sm text-ink-500">Every distribution you&apos;ve created from this wallet.</p>
        </div>
        {isConnected && isSepolia && distributions.length > 0 && (
          <Link href="/distribute">
            <Button>
              New drop
              <ArrowUpRight className="size-4" />
            </Button>
          </Link>
        )}
      </div>

      {!isConnected ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
            <Wallet className="size-8 text-ink-500" />
            <p className="text-sm text-ink-700">Connect your wallet to view your distributions.</p>
            <WalletButton />
          </CardContent>
        </Card>
      ) : !isSepolia ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
            <AlertTriangle className="size-8 text-error-600" />
            <p className="text-sm text-ink-700">VeilDrop runs on Sepolia testnet.</p>
            <WalletButton />
          </CardContent>
        </Card>
      ) : distributions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <Inbox className="size-8 text-ink-500" />
            <div>
              <p className="text-sm font-medium text-ink-900">No distributions yet</p>
              <p className="mt-1 text-sm text-ink-500">Create your first one, it takes a few minutes.</p>
            </div>
            <Link href="/distribute">
              <Button>Start distributing</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {distributions.map((d) => (
            <DistributionCard key={d.id} distribution={d} />
          ))}
        </div>
      )}
    </main>
  );
}
