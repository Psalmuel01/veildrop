"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle, ExternalLink, Clock3, Loader2, User } from "lucide-react";
import type { Hex } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { useClaim, useGetClaimAmount, useAirdropIsSignatureClaimed } from "@tokenops/sdk/fhe-airdrop/react";
import { RevealAmount } from "@/components/RevealAmount";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useDecryptedHandle } from "@/lib/hooks/useDecryptedHandle";
import { useCountdown } from "@/lib/hooks/useCountdown";
import { patchRecipient } from "@/lib/api";
import { formatAmount } from "@/lib/amount";
import type { ClaimPayload } from "@/lib/claim-link";

const SEPOLIA_EXPLORER = "https://sepolia.etherscan.io/tx/";

export interface ClaimFlowMeta {
  title?: string;
  description?: string | null;
  adminAddress?: string;
  claimWindowEnd?: string | null;
}

function truncate(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/**
 * Every hook here (directly or via useDecryptedHandle) needs a live
 * ZamaProvider, which only mounts once the wallet is connected on Sepolia,
 * so this must only ever be rendered on that happy path (see the two claim
 * pages that use this), never unconditionally.
 */
export function ClaimFlow({
  payload,
  recipientId,
  meta,
  tokenSymbol,
}: {
  payload: ClaimPayload;
  recipientId?: string;
  meta?: ClaimFlowMeta;
  tokenSymbol: string;
}) {
  const { push: toast } = useToast();
  const queryClient = useQueryClient();
  const [viewHandle, setViewHandle] = useState<Hex | undefined>();

  const { data: isClaimed, isLoading: isCheckingClaimed } = useAirdropIsSignatureClaimed({
    address: payload.airdrop,
    user: payload.recipient,
    encryptedAmountHandle: payload.handle,
  });

  const claim = useClaim({ address: payload.airdrop });
  const getClaimAmount = useGetClaimAmount({ address: payload.airdrop });
  const decrypted = useDecryptedHandle(viewHandle, payload.airdrop);
  const countdown = useCountdown(meta?.claimWindowEnd);

  useEffect(() => {
    if (viewHandle && !decrypted.isRevealed && !decrypted.isRevealing) {
      decrypted.reveal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewHandle]);

  useEffect(() => {
    if (decrypted.isRevealed && recipientId) {
      patchRecipient(recipientId, { revealed: true }).catch(() => null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decrypted.isRevealed]);

  async function handleDecryptClick() {
    if (viewHandle) {
      decrypted.reveal();
      return;
    }
    try {
      const res = await getClaimAmount.mutateAsync({
        encryptedInput: { handle: payload.handle, inputProof: payload.inputProof },
        signature: payload.signature,
      });
      setViewHandle(res.handle);
    } catch (err) {
      toast({
        kind: "error",
        title: "Couldn't unlock allocation",
        description: err instanceof Error ? err.message : undefined,
      });
    }
  }

  function handleClaim() {
    claim.mutate(
      { encryptedInput: { handle: payload.handle, inputProof: payload.inputProof }, signature: payload.signature },
      {
        onSuccess: (hash) => {
          queryClient.invalidateQueries({ queryKey: ["tokenops-sdk", "fhe-airdrop"] });
          toast({ kind: "success", title: "Claimed. Tokens are in your wallet." });
          if (recipientId) {
            patchRecipient(recipientId, { claimed: true, txHash: hash }).catch(() => null);
          }
        },
        onError: (err) => toast({ kind: "error", title: "Claim failed", description: err.message }),
      },
    );
  }

  const expired = countdown?.expired ?? false;

  // State 1 (not connected) is handled by the pages that render this. From
  // here on: 2 unclaimed, 3 claiming, 4 claimed-not-revealed, 5 decrypting,
  // 6 revealed.
  if (isCheckingClaimed) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-sm text-ink-500">
        <Loader2 className="size-5 animate-spin" />
        Checking claim status…
      </div>
    );
  }

  if (!isClaimed) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="encrypted-mask flex items-center gap-2 rounded-2xl bg-paper-100 px-8 py-6 font-display text-3xl font-semibold">
          ••••••
        </div>

        {countdown && (
          <p
            className={`flex items-center gap-1.5 text-xs font-medium ${expired ? "text-error-600" : "text-ink-500"}`}
          >
            <Clock3 className="size-3.5" />
            {countdown.label}
          </p>
        )}

        {expired ? (
          <div className="rounded-lg border border-error-600/25 bg-error-100 px-4 py-3 text-sm text-error-700">
            This claim window has closed. Contact the sender if you believe this is a mistake.
          </div>
        ) : (
          <Button size="lg" onClick={handleClaim} isLoading={claim.isPending}>
            {claim.isPending ? "Confirming transaction on Sepolia…" : "Claim allocation"}
          </Button>
        )}
      </div>
    );
  }

  const revealStatus = decrypted.isRevealed ? "revealed" : getClaimAmount.isPending || decrypted.isRevealing ? "decrypting" : "masked";

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex items-center gap-2 rounded-full bg-success-100 px-3 py-1 text-xs font-medium text-success-700">
        <CheckCircle2 className="size-3.5" />
        Claimed to your wallet
      </div>

      <RevealAmount
        status={revealStatus}
        value={decrypted.value !== undefined ? formatAmount(decrypted.value) : undefined}
        symbol={tokenSymbol}
        onDecrypt={handleDecryptClick}
      />

      {decrypted.isRevealed && (meta?.title || meta?.adminAddress || claim.data) && (
        <div className="w-full rounded-xl border border-ink-900/[0.06] bg-paper-100 p-4 text-left text-sm">
          {meta?.title && <p className="font-medium text-ink-900">{meta.title}</p>}
          {meta?.description && <p className="mt-1 text-xs text-ink-500">{meta.description}</p>}
          {meta?.adminAddress && (
            <p className="mt-2 flex items-center gap-1.5 font-mono text-xs text-ink-500">
              <User className="size-3" />
              From {truncate(meta.adminAddress)}
            </p>
          )}
          {claim.data && (
            <a
              href={`${SEPOLIA_EXPLORER}${claim.data}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-900"
            >
              View claim transaction
              <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      )}

      {!decrypted.isRevealed && (
        <p className="flex items-center gap-1.5 text-xs text-ink-500">
          <Circle className="size-3" />
          Decrypt whenever you like, there is no rush.
        </p>
      )}
    </div>
  );
}
