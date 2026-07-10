"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAccount } from "wagmi";
import { sepolia } from "wagmi/chains";
import { ArrowLeft, ExternalLink, Wallet, AlertTriangle, CheckCircle2, Clock3, FileText, Copy, Inbox } from "lucide-react";
import { WalletButton } from "@/components/WalletButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EncryptedBadge } from "@/components/EncryptedBadge";
import { RecipientStatusRow } from "@/components/dashboard/RecipientStatusRow";
import { RecipientVestingRow } from "@/components/dashboard/RecipientVestingRow";
import { useToast } from "@/components/ui/Toast";
import { getDistribution, patchRecipient, type ApiDistribution } from "@/lib/api";

const SEPOLIA_EXPLORER = "https://sepolia.etherscan.io/tx/";
const SEPOLIA_ADDRESS_EXPLORER = "https://sepolia.etherscan.io/address/";

export default function DistributionDetailPage() {
  const params = useParams<{ id: string }>();
  const { isConnected, chainId } = useAccount();
  const isSepolia = chainId === sepolia.id;
  const { push: toast } = useToast();
  const [distribution, setDistribution] = useState<ApiDistribution | null | undefined>(undefined);
  const [claimedCount, setClaimedCount] = useState(0);
  const claimedByAddress = useRef(new Map<string, boolean>());

  useEffect(() => {
    getDistribution(params.id).then((found) => {
      setDistribution(found);
      if (found) {
        claimedByAddress.current = new Map(found.recipients.map((r) => [r.address, r.claimed]));
        setClaimedCount(found.recipients.filter((r) => r.claimed).length);
      }
    });
  }, [params.id]);

  // The claim status here comes from a live on-chain check (see
  // RecipientStatusRow), which is the only place that knows the real state.
  // Persist it back to the backend so /received and the main dashboard list
  // reflect it too, instead of only ever showing the snapshot written when
  // the airdrop was first created.
  function handleStatus(recipientId: string, recipientAddress: string, claimed: boolean) {
    const alreadyKnown = claimedByAddress.current.get(recipientAddress);
    claimedByAddress.current.set(recipientAddress, claimed);
    setClaimedCount(Array.from(claimedByAddress.current.values()).filter(Boolean).length);

    if (alreadyKnown === claimed) return;
    patchRecipient(recipientId, { claimed }).catch(() => null);
    setDistribution((d) =>
      d
        ? { ...d, recipients: d.recipients.map((r) => (r.id === recipientId ? { ...r, claimed } : r)) }
        : d,
    );
  }

  function copyAddress(address: string) {
    navigator.clipboard.writeText(address);
    toast({ kind: "success", title: "Address copied" });
  }

  return (
    <main className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
      <Link href="/dashboard" className="mb-6 flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
        <ArrowLeft className="size-3.5" />
        Back to my drops
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
      ) : distribution === undefined ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : distribution === null ? (
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
                  <p className="text-sm font-semibold text-ink-900">{distribution.recipients.length}</p>
                </div>
                {distribution.mode === "airdrop" && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-ink-500">Claimed</p>
                    <p className="flex items-center gap-1 text-sm font-semibold text-ink-900">
                      <CheckCircle2 className="size-3.5 text-success-600" />
                      {claimedCount} / {distribution.recipients.length}
                    </p>
                  </div>
                )}
                {distribution.mode === "vesting" && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-ink-500">Schedules</p>
                    <p className="flex items-center gap-1 text-sm font-semibold text-ink-900">
                      <Clock3 className="size-3.5 text-accent-600" />
                      {distribution.recipients.length} active
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

              <div className="flex flex-wrap gap-2">
                {distribution.txHash && (
                  <a
                    href={`${SEPOLIA_EXPLORER}${distribution.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-fit items-center gap-1.5 rounded-lg border border-ink-900/[0.08] px-3 py-1.5 font-mono text-xs text-ink-700 hover:border-ink-900/[0.22]"
                  >
                    {distribution.txHash.slice(0, 10)}…{distribution.txHash.slice(-8)}
                    <ExternalLink className="size-3" />
                  </a>
                )}
                {distribution.contractAddress && (
                  <div className="flex w-fit items-center gap-1.5 rounded-lg border border-accent-600/25 bg-accent-100/40 px-3 py-1.5 font-mono text-xs text-ink-700">
                    <FileText className="size-3 text-accent-600" />
                    {distribution.contractAddress.slice(0, 8)}…{distribution.contractAddress.slice(-6)}
                    <button
                      onClick={() => copyAddress(distribution.contractAddress!)}
                      className="text-ink-500 hover:text-ink-900"
                      aria-label="Copy contract address"
                    >
                      <Copy className="size-3" />
                    </button>
                    <a
                      href={`${SEPOLIA_ADDRESS_EXPLORER}${distribution.contractAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink-500 hover:text-ink-900"
                      aria-label="View airdrop contract on Etherscan"
                    >
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {distribution.mode === "airdrop"
                    ? "Recipient Claim Ledger"
                    : distribution.mode === "vesting"
                      ? "Vesting Schedule Ledger"
                      : "Recipient Delivery Ledger"}
                </CardTitle>
                <span className="flex items-center gap-1.5 text-xs text-ink-500">
                  <Clock3 className="size-3.5" />
                  {distribution.mode === "airdrop"
                    ? `${claimedCount} confirmed`
                    : distribution.mode === "vesting"
                      ? `${distribution.recipients.length} schedules`
                      : "Delivered"}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-hidden rounded-b-2xl border-t border-ink-900/[0.06]">
                {distribution.recipients.length === 0 && (
                  <div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
                    <Inbox className="size-7 text-ink-500" />
                    <p className="text-sm text-ink-500">No recipients on this distribution.</p>
                  </div>
                )}
                {distribution.recipients.map((r) =>
                  distribution.mode === "airdrop" ? (
                    <RecipientStatusRow
                      key={r.id}
                      id={r.id}
                      address={r.address}
                      claimUrl={r.claimUrl ?? undefined}
                      notifiedAt={r.notifiedAt}
                      onStatus={(claimed) => handleStatus(r.id, r.address, claimed)}
                    />
                  ) : distribution.mode === "vesting" ? (
                    <RecipientVestingRow
                      key={r.id}
                      address={r.address}
                      vestingId={r.vestingId}
                      managerAddress={distribution.contractAddress as `0x${string}`}
                      totalClaimedAmount={r.totalClaimedAmount}
                    />
                  ) : (
                    <div
                      key={r.id}
                      className="flex items-center justify-between gap-3 border-b border-ink-900/[0.04] px-4 py-2.5 last:border-0"
                    >
                      <span className="truncate font-mono text-xs text-ink-900">{r.address}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-ink-500">
                          {r.amountDisplay} {distribution.tokenSymbol}
                        </span>
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
  );
}
