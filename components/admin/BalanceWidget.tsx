"use client";

import { Lock } from "lucide-react";
import { useFaucetMetadata, useConfidentialBalance } from "@tokenops/sdk/testnet-faucet/react";
import { useDecryptedHandle } from "@/lib/hooks/useDecryptedHandle";
import { formatAmount } from "@/lib/amount";
import { cn } from "@/lib/cn";

export function BalanceWidget() {
  const { data: meta } = useFaucetMetadata();
  const { data: handle } = useConfidentialBalance();
  const { value, isRevealing, isRevealed, reveal } = useDecryptedHandle(handle, meta?.confidential.address);

  if (!meta) return null;

  return (
    <button
      onClick={reveal}
      disabled={isRevealed || isRevealing}
      className={cn(
        "flex h-9 items-center gap-1.5 rounded-full border border-ink-900/15 bg-paper-50 px-3 font-mono text-xs text-ink-700 transition-colors",
        !isRevealed && "hover:border-accent-600/40",
      )}
      title={isRevealed ? "Your confidential balance" : "Click to reveal your balance"}
    >
      {isRevealed ? (
        <span className="text-ink-900">
          {formatAmount(value!)} {meta.confidential.symbol}
        </span>
      ) : (
        <>
          <Lock className="size-3" />
          <span className="encrypted-mask">••••</span>
          {isRevealing && <span className="text-ink-500">revealing</span>}
        </>
      )}
    </button>
  );
}
