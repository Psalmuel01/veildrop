"use client";

import { useAccount } from "wagmi";
import { Inbox, Wallet } from "lucide-react";
import { WalletButton } from "@/components/WalletButton";
import { Card, CardContent } from "@/components/ui/Card";

// Placeholder route. Real data arrives once GET /api/recipients/pending
// (and a claimed history endpoint) exist. For now this just confirms the
// route lives under the recipient layout, not the admin one.
export default function ReceivedPage() {
  const { isConnected } = useAccount();

  return (
    <main className="mx-auto max-w-lg px-5 py-16 sm:px-8">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-ink-900">
          Received<span className="text-accent-600">.</span>
        </h1>
        <p className="mt-2 text-sm text-ink-500">Everything sent to this wallet, in one place.</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          {!isConnected ? (
            <>
              <Wallet className="size-8 text-ink-500" />
              <p className="text-sm text-ink-700">Connect your wallet to see what has been sent to you.</p>
              <WalletButton />
            </>
          ) : (
            <>
              <Inbox className="size-8 text-ink-500" />
              <div>
                <p className="text-sm font-medium text-ink-900">Coming soon</p>
                <p className="mt-1 text-sm text-ink-500">
                  Your claim history will show up here once this is connected to real data.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
