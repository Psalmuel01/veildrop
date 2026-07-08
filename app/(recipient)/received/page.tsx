"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import { CheckCircle2, Clock3, Inbox, ShieldCheck, Wallet } from "lucide-react";
import { WalletButton } from "@/components/WalletButton";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getPendingDistributions, type PendingDistribution } from "@/lib/pending-distributions";

// Placeholder route. Real data arrives once GET /api/recipients/pending
// (and a claimed history endpoint) exist. For now this just confirms the
// route lives under the recipient layout, not the admin one.
export default function ReceivedPage() {
  const { address, isConnected } = useAccount();
  const [pending, setPending] = useState<PendingDistribution[]>([]);

  useEffect(() => {
    if (!address) {
      setPending([]);
      return;
    }
    getPendingDistributions(address).then(setPending);
  }, [address]);

  return (
    <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-ink-900">
          Received<span className="text-accent-600">.</span>
        </h1>
        <p className="mt-2 text-sm text-ink-500">Pending confidential allocations and claimed history for this wallet.</p>
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
        <div className="grid gap-4">
          <Card>
            <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-100 text-accent-600">
                <ShieldCheck className="size-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-900">Your wallet controls the reveal</p>
                <p className="mt-1 text-sm text-ink-500">
                  VeilDrop can list claim opportunities here, but each amount only decrypts after your wallet signs.
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
                    <div>
                      <p className="text-sm font-medium text-ink-900">No pending claims found</p>
                      <p className="mt-1 text-xs text-ink-500">Claim discovery will populate here once the backend indexer is connected.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {pending.map((item) => (
                      <div key={item.id} className="rounded-lg border border-ink-900/[0.06] px-3 py-2">
                        <p className="text-sm font-medium text-ink-900">{item.title}</p>
                        <p className="text-xs capitalize text-ink-500">{item.mode}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-5">
                <div className="mb-4 flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-success-600" />
                  <h2 className="text-sm font-semibold text-ink-900">Claimed</h2>
                </div>
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-ink-900/[0.08] px-4 py-10 text-center">
                  <Inbox className="size-7 text-ink-500" />
                  <div>
                    <p className="text-sm font-medium text-ink-900">Claim history coming next</p>
                    <p className="mt-1 text-xs text-ink-500">A claimed-history endpoint will let this page become your private allocation archive.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center">
            <Link href="/docs">
              <Button variant="secondary">Read recipient docs</Button>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
