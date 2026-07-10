"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, AlertTriangle, ShieldQuestion } from "lucide-react";
import { useMintConfidential } from "@tokenops/sdk/testnet-faucet/react";
import { useConfidentialBalanceHandle } from "@/lib/hooks/useConfidentialBalanceHandle";
import { useDecryptedHandle } from "@/lib/hooks/useDecryptedHandle";
import { useMintVeilToken } from "@/lib/hooks/useMintVeilToken";
import { formatAmount } from "@/lib/amount";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { getTokenConfig, getTokenConfigByAddress } from "@/lib/tokens";
import type { Address } from "viem";

export function BalanceCheck({
  tokenAddress,
  tokenSymbol,
  requiredRaw,
  onResolved,
  tokenId: explicitTokenId,
}: {
  tokenAddress: Address;
  tokenSymbol: string;
  requiredRaw: bigint;
  onResolved?: (sufficient: boolean) => void;
  tokenId?: string;
}) {
  const queryClient = useQueryClient();
  const { push: toast } = useToast();
  const { handle } = useConfidentialBalanceHandle(tokenAddress);

  const { value, isRevealing, isRevealed, reveal } = useDecryptedHandle(handle, tokenAddress);
  const mintCTTT = useMintConfidential();
  const mintVeilToken = useMintVeilToken();

  // Derive tokenId from address if not explicitly provided
  const tokenIdFromAddress = getTokenConfigByAddress(tokenAddress)?.id || "veil";
  const tokenId = explicitTokenId || tokenIdFromAddress;
  const selectedToken = getTokenConfig(tokenId);

  const sufficient = value !== undefined && value >= requiredRaw;

  useEffect(() => {
    if (isRevealed) onResolved?.(sufficient);
  }, [isRevealed, sufficient, onResolved]);

  if (!isRevealed) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-ink-900/[0.06] bg-paper-100 px-4 py-3">
        <span className="flex items-center gap-2 text-sm text-ink-700">
          <ShieldQuestion className="size-4 text-ink-500" />
          Confirm you hold enough {tokenSymbol} before executing.
        </span>
        <Button size="sm" variant="secondary" onClick={reveal} isLoading={isRevealing}>
          Check balance
        </Button>
      </div>
    );
  }

  if (sufficient) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-success-600/25 bg-success-100 px-4 py-3 text-sm text-success-700">
        <CheckCircle2 className="size-4" />
        Balance covers this distribution. {formatAmount(value!)} {tokenSymbol} available.
      </div>
    );
  }

  const handleMintVeil = () => {
    mintVeilToken.mint(1_000_000_000n).then(() => {
      queryClient.invalidateQueries({ queryKey: ["tokenops-sdk", "testnet-faucet"] });
      toast({ kind: "success", title: `Minted 1,000 ${selectedToken.symbol}` });
      reveal();
    }).catch((err) => {
      toast({ kind: "error", title: "Mint failed", description: err.message });
    });
  };

  const handleMintCTTT = () => {
    mintCTTT.mutate(
      { amount: 1_000_000_000n },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["tokenops-sdk", "testnet-faucet"] });
          toast({ kind: "success", title: "Minted 1,000 CTTT" });
          reveal();
        },
        onError: (err) => toast({ kind: "error", title: "Mint failed", description: err.message }),
      },
    );
  };

  const isPending = selectedToken.id === "veil" ? mintVeilToken.isPending : mintCTTT.isPending;
  const handleMint = selectedToken.id === "veil" ? handleMintVeil : handleMintCTTT;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-error-600/25 bg-error-100 px-4 py-3 text-sm text-error-700 sm:flex-row sm:items-center sm:justify-between">
      <span className="flex items-center gap-2">
        <AlertTriangle className="size-4" />
        Only {formatAmount(value!)} {tokenSymbol} available. You need confidential test tokens.
      </span>
      <Button
        size="sm"
        onClick={handleMint}
        isLoading={isPending}
      >
        Mint 1,000 {tokenSymbol}
      </Button>
    </div>
  );
}
