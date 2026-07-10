"use client";

import { useEffect, useState } from "react";
import type { Address, Hex } from "viem";
import { ExternalLink, Clock3 } from "lucide-react";
import { useZamaSDK } from "@zama-fhe/react-sdk";
import { useVestingInfo, useManagerFeeInfo, useGetClaimableAmount, useGetTotalAllocation, useClaim, FeeType } from "@tokenops/sdk/fhe-vesting/react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { EncryptedBadge } from "@/components/EncryptedBadge";
import { VestingScheduleTimeline } from "@/components/distribute/VestingScheduleTimeline";
import { useDecryptedHandle } from "@/lib/hooks/useDecryptedHandle";
import { formatAmount } from "@/lib/amount";
import { toTokenOpsEncryptor } from "@/lib/encryptor-adapter";
import { recordVestingClaim, type VestingClaimDto } from "@/lib/api";

const SEPOLIA_EXPLORER = "https://sepolia.etherscan.io/tx/";

function formatDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function VestingScheduleView({
  recipientId,
  managerAddress,
  vestingId,
  tokenSymbol,
  totalClaimedAmount,
  claims,
  onClaimed,
}: {
  recipientId: string;
  managerAddress: Address;
  vestingId: Hex;
  tokenSymbol: string;
  totalClaimedAmount: string | null;
  claims: VestingClaimDto[];
  onClaimed?: () => void;
}) {
  const { push: toast } = useToast();
  const zamaSDK = useZamaSDK();

  const { data: info, isLoading: isLoadingInfo } = useVestingInfo({ address: managerAddress, vestingId });
  const { data: feeInfo } = useManagerFeeInfo({ address: managerAddress });

  const [claimableHandle, setClaimableHandle] = useState<Hex | undefined>(undefined);
  const [totalHandle, setTotalHandle] = useState<Hex | undefined>(undefined);

  const getClaimable = useGetClaimableAmount({ address: managerAddress, encryptor: () => toTokenOpsEncryptor(zamaSDK.relayer) });
  const getTotal = useGetTotalAllocation({ address: managerAddress, encryptor: () => toTokenOpsEncryptor(zamaSDK.relayer) });
  const claim = useClaim({ address: managerAddress });

  const claimableDecrypt = useDecryptedHandle(claimableHandle, managerAddress);
  const totalDecrypt = useDecryptedHandle(totalHandle, managerAddress);

  // The handle only becomes valid to decrypt once it lands in state on a
  // fresh render, calling reveal() in the same event handler that requested
  // it would still be using the previous, unconfigured hook instance.
  useEffect(() => {
    if (claimableHandle && !claimableDecrypt.isRevealed && !claimableDecrypt.isRevealing) claimableDecrypt.reveal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claimableHandle]);

  useEffect(() => {
    if (totalHandle && !totalDecrypt.isRevealed && !totalDecrypt.isRevealing) totalDecrypt.reveal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalHandle]);

  async function handleCheckClaimable() {
    try {
      const result = await getClaimable.mutateAsync({ vestingId });
      setClaimableHandle(result.handle);
    } catch (err) {
      toast({ kind: "error", title: "Could not check claimable amount", description: err instanceof Error ? err.message : undefined });
    }
  }

  async function handleCheckTotal() {
    try {
      const result = await getTotal.mutateAsync({ vestingId });
      setTotalHandle(result.handle);
    } catch (err) {
      toast({ kind: "error", title: "Could not check total allocation", description: err instanceof Error ? err.message : undefined });
    }
  }

  async function handleClaim() {
    if (!feeInfo || claimableDecrypt.value === undefined) return;
    try {
      const hash = await claim.mutateAsync(
        feeInfo.feeType === FeeType.Gas
          ? { vestingId, feeType: FeeType.Gas, value: feeInfo.fee }
          : { vestingId, feeType: FeeType.DistributionToken },
      );
      await recordVestingClaim({ recipientId, amountDisplay: formatAmount(claimableDecrypt.value), txHash: hash });
      toast({ kind: "success", title: "Claim confirmed" });
      setClaimableHandle(undefined);
      onClaimed?.();
    } catch (err) {
      toast({ kind: "error", title: "Claim failed", description: err instanceof Error ? err.message : undefined });
    }
  }

  const now = Math.floor(Date.now() / 1000);
  const cliffEnd = info?.cliffReleaseTimestamp ?? 0;
  const stillInCliff = !!info && now < cliffEnd;
  const canClaim = claimableDecrypt.isRevealed && (claimableDecrypt.value ?? 0n) > 0n;

  return (
    <div className="flex flex-col gap-6">
      {isLoadingInfo || !info ? (
        <div className="h-16 animate-pulse rounded-xl bg-ink-900/[0.04]" />
      ) : (
        <div>
          <p className="mb-2 text-sm font-medium text-ink-900">Schedule</p>
          <VestingScheduleTimeline
            startTimestamp={info.startTimestamp}
            cliffSeconds={Math.max(info.cliffReleaseTimestamp - info.startTimestamp, 0)}
            vestingSeconds={Math.max(info.endTimestamp - info.cliffReleaseTimestamp, 0)}
          />
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-ink-900/[0.06] bg-paper-50 p-5">
          <p className="text-xs uppercase tracking-wide text-ink-500">Total allocation</p>
          {totalDecrypt.isRevealed ? (
            <p className="font-mono text-2xl font-semibold text-ink-900">
              {formatAmount(totalDecrypt.value ?? 0n)} <span className="text-sm text-ink-500">{tokenSymbol}</span>
            </p>
          ) : (
            <>
              <EncryptedBadge />
              <Button size="sm" variant="secondary" isLoading={getTotal.isPending || totalDecrypt.isRevealing} onClick={handleCheckTotal}>
                Check total allocation
              </Button>
            </>
          )}
        </div>

        <div className="flex flex-col items-center gap-3 rounded-xl border border-accent-600/25 bg-accent-100/30 p-5">
          <p className="text-xs uppercase tracking-wide text-ink-500">Currently claimable</p>
          {claimableDecrypt.isRevealed ? (
            (claimableDecrypt.value ?? 0n) > 0n ? (
              <p className="font-mono text-2xl font-semibold text-ink-900">
                {formatAmount(claimableDecrypt.value ?? 0n)} <span className="text-sm text-ink-500">{tokenSymbol}</span>
              </p>
            ) : (
              <div className="flex items-center gap-1.5 text-sm text-ink-500">
                <Clock3 className="size-3.5" />
                {stillInCliff ? `Nothing claimable yet. Unlocking begins ${formatDate(cliffEnd)}.` : "Nothing new to claim right now."}
              </div>
            )
          ) : (
            <>
              <EncryptedBadge />
              <Button
                size="sm"
                variant="secondary"
                isLoading={getClaimable.isPending || claimableDecrypt.isRevealing}
                onClick={handleCheckClaimable}
              >
                Check claimable amount
              </Button>
            </>
          )}
          {canClaim && (
            <Button size="sm" isLoading={claim.isPending} onClick={handleClaim}>
              Claim available amount
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-ink-900/[0.06] bg-paper-50 p-4">
        <p className="mb-2 text-sm font-medium text-ink-900">
          Claimed so far
          {totalClaimedAmount && (
            <span className="ml-2 font-mono text-xs font-normal text-ink-500">
              {totalClaimedAmount} {tokenSymbol} total
            </span>
          )}
        </p>
        {claims.length === 0 ? (
          <p className="text-sm text-ink-500">No claims yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {claims.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 border-b border-ink-900/[0.04] py-2 last:border-0">
                <div>
                  <p className="font-mono text-sm text-ink-900">
                    {c.amountDisplay} {tokenSymbol}
                  </p>
                  <p className="text-[11px] text-ink-500">{new Date(c.claimedAt).toLocaleString()}</p>
                </div>
                <a
                  href={`${SEPOLIA_EXPLORER}${c.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-mono text-xs text-ink-500 hover:text-accent-600"
                >
                  {c.txHash.slice(0, 8)}…{c.txHash.slice(-6)}
                  <ExternalLink className="size-3" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
