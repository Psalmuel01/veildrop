"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import { CheckCircle2, Clock3, Eye, Inbox, ShieldCheck, Wallet } from "lucide-react";
import { WalletButton } from "@/components/WalletButton";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { getRecipientHistory, type HistoryRecipient } from "@/lib/api";

function truncate(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function RecipientRow({ item }: { item: HistoryRecipient }) {
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

  const pending = history.filter((h) => !h.claimed);
  const claimed = history.filter((h) => h.claimed);

  return (
    <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-ink-900">
          Received<span className="text-accent-600">.</span>
        </h1>
        <p className="mt-2 text-sm text-ink-500">Everything sent to this wallet, in one place.</p>
      </div>

      {!isConnected ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <Wallet className="size-8 text-ink-500" />
            <p className="text-sm text-ink-700">Connect your wallet to see what has been sent to you.</p>
            <WalletButton />
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Skeleton className="h-64 w-full" />
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
        <div className="grid gap-4">
          <Card>
            <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-100 text-accent-600">
                <ShieldCheck className="size-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-900">Your wallet controls the reveal</p>
                <p className="mt-1 text-sm text-ink-500">
                  Every amount here stays sealed until you decrypt it yourself. Nobody else, including VeilDrop, can
                  see it.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="py-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock3 className="size-4 text-accent-600" />
                    <h2 className="text-sm font-semibold text-ink-900">Pending</h2>
                  </div>
                  <span className="rounded-full bg-ink-900/5 px-2 py-0.5 text-xs text-ink-500">{pending.length}</span>
                </div>
                {pending.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-ink-900/[0.08] px-4 py-10 text-center">
                    <Inbox className="size-7 text-ink-500" />
                    <p className="text-sm text-ink-500">Nothing waiting on you right now.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {pending.map((item) => (
                      <RecipientRow key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-success-600" />
                    <h2 className="text-sm font-semibold text-ink-900">Claimed</h2>
                  </div>
                  <span className="rounded-full bg-ink-900/5 px-2 py-0.5 text-xs text-ink-500">{claimed.length}</span>
                </div>
                {claimed.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-ink-900/[0.08] px-4 py-10 text-center">
                    <Inbox className="size-7 text-ink-500" />
                    <p className="text-sm text-ink-500">Claimed allocations will build up here.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {claimed.map((item) => (
                      <RecipientRow key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </main>
  );
}
