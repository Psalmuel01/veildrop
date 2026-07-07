"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAccount } from "wagmi";
import { sepolia } from "wagmi/chains";
import { ArrowLeft, ExternalLink, Wallet, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/Header";
import { WalletButton } from "@/components/WalletButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EncryptedBadge } from "@/components/EncryptedBadge";
import { RecipientStatusRow } from "@/components/dashboard/RecipientStatusRow";
import { loadDistributions, type StoredDistribution } from "@/lib/distributions";

const SEPOLIA_EXPLORER = "https://sepolia.etherscan.io/tx/";

export default function DistributionDetailPage() {
  const params = useParams<{ id: string }>();
  const { address, isConnected, chainId } = useAccount();
  const isSepolia = chainId === sepolia.id;
  const [distribution, setDistribution] = useState<StoredDistribution | null | undefined>(undefined);
  const [claimedCount, setClaimedCount] = useState(0);
  const claimedByAddress = useRef(new Map<string, boolean>());

  useEffect(() => {
    if (!address) return;
    const found = loadDistributions(address).find((d) => d.id === params.id);
    setDistribution(found ?? null);
  }, [address, params.id]);

  function handleStatus(recipientAddress: string, claimed: boolean) {
    claimedByAddress.current.set(recipientAddress, claimed);
    setClaimedCount(Array.from(claimedByAddress.current.values()).filter(Boolean).length);
  }

  return (
    <div className="min-h-screen bg-paper-100">
      <Header />
      <main className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
        <Link href="/dashboard" className="mb-6 flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
          <ArrowLeft className="size-3.5" />
          Back to dashboard
        </Link>

        {!isConnected ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
              <Wallet className="size-8 text-ink-500" />
              <p className="text-sm text-ink-700">Connect your wallet to view this distribution.</p>
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
        ) : distribution === undefined ? null : distribution === null ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
              <p className="text-sm text-ink-700">Distribution not found for this wallet.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{distribution.title}</CardTitle>
                  <EncryptedBadge />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4 rounded-lg bg-paper-100 p-4 sm:grid-cols-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-ink-500">Mode</p>
                    <p className="text-sm font-semibold capitalize text-ink-900">{distribution.mode}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-ink-500">Recipients</p>
                    <p className="text-sm font-semibold text-ink-900">{distribution.recipientCount}</p>
                  </div>
                  {distribution.mode === "airdrop" && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-ink-500">Claimed</p>
                      <p className="flex items-center gap-1 text-sm font-semibold text-ink-900">
                        <CheckCircle2 className="size-3.5 text-success-600" />
                        {claimedCount} / {distribution.recipientCount}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs uppercase tracking-wide text-ink-500">Created</p>
                    <p className="text-sm font-semibold text-ink-900">
                      {new Date(distribution.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <a
                  href={`${SEPOLIA_EXPLORER}${distribution.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-fit items-center gap-1.5 rounded-lg border border-ink-900/15 px-3 py-1.5 font-mono text-xs text-ink-700 hover:border-ink-900/30"
                >
                  {distribution.txHash.slice(0, 10)}…{distribution.txHash.slice(-8)}
                  <ExternalLink className="size-3" />
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recipients</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-hidden rounded-b-2xl border-t border-ink-900/10">
                  {distribution.recipients.map((r) =>
                    distribution.mode === "airdrop" ? (
                      <RecipientStatusRow
                        key={r.address}
                        address={r.address}
                        claimUrl={r.claimUrl}
                        onStatus={(claimed) => handleStatus(r.address, claimed)}
                      />
                    ) : (
                      <div
                        key={r.address}
                        className="flex items-center justify-between gap-3 border-b border-ink-900/6 px-4 py-2.5 last:border-0"
                      >
                        <span className="truncate font-mono text-xs text-ink-900">{r.address}</span>
                        <div className="flex items-center gap-3">
                          <EncryptedBadge />
                          <span className="flex items-center gap-1 text-xs font-medium text-success-700">
                            <CheckCircle2 className="size-3.5" />
                            Delivered
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
