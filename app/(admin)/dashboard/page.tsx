"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { sepolia } from "wagmi/chains";
import {
  Inbox,
  Wallet,
  AlertTriangle,
  ArrowUpRight,
  Send,
  Gift,
  Activity,
  CheckCircle2,
  Clock3,
  Users,
  FileEdit,
  Copy,
} from "lucide-react";
import { WalletButton } from "@/components/WalletButton";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { listDistributions, listDrafts, type ApiDistribution, type DraftDto } from "@/lib/api";
import { TEMPLATES } from "@/lib/templates";
import { formatAmount, toBaseUnits } from "@/lib/amount";

function timeAgo(iso: string): string {
  const diffMinutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function claimedTotal(distribution: ApiDistribution): number {
  return distribution.recipients.filter((recipient) => recipient.claimed).length;
}

function distributionTotalDisplay(distribution: ApiDistribution): string {
  const totalRaw = distribution.recipients.reduce((sum, r) => sum + toBaseUnits(r.amountDisplay), 0n);
  return `${formatAmount(totalRaw)} ${distribution.tokenSymbol}`;
}

function draftTitle(draft: DraftDto): string {
  const formState = draft.formState as { config?: { title?: string } } | null;
  const templateTitle = TEMPLATES.find((t) => t.id === draft.template)?.copy.title;
  return formState?.config?.title || templateTitle || "Untitled distribution";
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: typeof Activity;
}) {
  return (
    <div className="rounded-xl border border-ink-900/[0.06] bg-paper-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-ink-500">{label}</p>
        <Icon className="size-4 text-ink-500" />
      </div>
      <p className="font-display text-2xl font-bold text-ink-900">{value}</p>
      <p className="mt-1 text-xs text-ink-500">{detail}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { address, isConnected, chainId } = useAccount();
  const isSepolia = chainId === sepolia.id;
  const [distributions, setDistributions] = useState<ApiDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [drafts, setDrafts] = useState<DraftDto[]>([]);

  useEffect(() => {
    if (!address) return;
    setIsLoading(true);
    listDistributions(address)
      .then(setDistributions)
      .finally(() => setIsLoading(false));
    listDrafts(address).then(setDrafts);
  }, [address]);

  const totalRecipients = distributions.reduce((sum, distribution) => sum + distribution.recipients.length, 0);
  const airdrops = distributions.filter((distribution) => distribution.mode === "airdrop");
  const pendingClaims = airdrops.reduce(
    (sum, distribution) => sum + Math.max(distribution.recipients.length - claimedTotal(distribution), 0),
    0,
  );
  const completedDrops = distributions.filter((distribution) => {
    if (distribution.mode === "disperse") return true;
    return Math.max(distribution.recipients.length - claimedTotal(distribution), 0) === 0;
  }).length;

  return (
    <main className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900">My Drops</h1>
          <p className="mt-1 text-sm text-ink-500">Monitor encrypted drops, claim progress, and operational history.</p>
        </div>
        {isConnected && isSepolia && distributions.length > 0 && (
          <div className="flex items-center gap-2">
            <Link href={`/distribute?duplicate=${distributions[0]!.id}`}>
              <Button variant="secondary">
                <Copy className="size-4" />
                Duplicate last
              </Button>
            </Link>
            <Link href="/distribute">
              <Button>
                New drop
                <ArrowUpRight className="size-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {isConnected && isSepolia && drafts.length > 0 && (
        <div className="mb-6 rounded-xl border border-accent-600/25 bg-accent-100/30 p-5">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ink-900">
            <FileEdit className="size-4 text-accent-600" />
            Continue draft
          </h2>
          <div className="flex flex-col gap-2.5">
            {drafts.map((draft) => (
              <Link
                key={draft.id}
                href="/distribute"
                className="group flex items-center gap-3.5 rounded-xl border border-ink-900/[0.06] bg-paper-50 p-3.5 transition-all hover:-translate-y-0.5 hover:border-accent-600/40"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-ink-900/[0.05] text-ink-600 transition-colors group-hover:bg-accent-600/10 group-hover:text-accent-600">
                  {draft.mode === "disperse" ? <Send className="size-4" /> : <Gift className="size-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{draftTitle(draft)}</p>
                  <p className="mt-0.5 text-[11px] text-ink-500">Last edited {timeAgo(draft.updatedAt)}</p>
                </div>
                <ArrowUpRight className="size-4 shrink-0 text-ink-500 transition-colors group-hover:text-accent-600" />
              </Link>
            ))}
          </div>
        </div>
      )}

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
      ) : isLoading ? (
        <Skeleton className="h-64 w-full" />
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
        <div className="flex flex-col gap-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Drops" value={distributions.length} detail="Created from this wallet" icon={Activity} />
            <StatCard label="Recipients" value={totalRecipients} detail="Addresses served" icon={Users} />
            <StatCard label="Pending claims" value={pendingClaims} detail="Airdrop recipients remaining" icon={Clock3} />
            <StatCard label="Complete" value={completedDrops} detail="No admin action needed" icon={CheckCircle2} />
          </div>

          <div className="rounded-xl border border-ink-900/[0.06] bg-paper-50 p-5">
            <h2 className="mb-4 text-sm font-semibold text-ink-900">Recent drops</h2>
            <div className="flex flex-col gap-2.5">
              {distributions.slice(0, 5).map((distribution) => {
                const Icon = distribution.mode === "disperse" ? Send : Gift;
                const claimed = claimedTotal(distribution);
                const recipientCount = distribution.recipients.length;
                const pending = Math.max(recipientCount - claimed, 0);
                const isComplete = distribution.mode === "disperse" || pending === 0;
                const progress = recipientCount > 0 ? (claimed / recipientCount) * 100 : 0;
                return (
                  <Link
                    key={distribution.id}
                    href={`/dashboard/${distribution.id}`}
                    className="group flex items-center gap-3.5 rounded-xl border border-ink-900/[0.06] bg-paper-100/50 p-3.5 transition-all hover:-translate-y-0.5 hover:border-accent-600/40 hover:shadow-[0_12px_30px_-12px_rgba(0,0,0,0.4)]"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-ink-900/[0.05] text-ink-600 transition-colors group-hover:bg-accent-600/10 group-hover:text-accent-600">
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-900">{distribution.title}</p>
                      <p className="mt-0.5 truncate text-[11px] text-ink-500">
                        <span className="font-mono text-ink-700">{distributionTotalDisplay(distribution)}</span>
                        {" · "}
                        {recipientCount} recipient{recipientCount !== 1 ? "s" : ""}
                        {" · "}
                        <span className="capitalize">{distribution.mode}</span>
                        {" · "}
                        {timeAgo(distribution.createdAt)}
                      </p>
                      {distribution.mode === "airdrop" && (
                        <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink-900/10">
                          <div
                            className="h-full rounded-full bg-success-600 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          isComplete
                            ? "bg-success-600/10 text-success-700"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {isComplete ? "Complete" : `${pending} pending`}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
