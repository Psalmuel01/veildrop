"use client";

import { useAccount } from "wagmi";
import { sepolia } from "wagmi/chains";
import { Card, CardContent } from "@/components/ui/Card";
import { RevealAmount } from "@/components/RevealAmount";
import { useConfidentialBalanceHandle } from "@/lib/hooks/useConfidentialBalanceHandle";
import { useDecryptedHandle } from "@/lib/hooks/useDecryptedHandle";
import { useIsZamaReady } from "@/app/providers";
import { formatAmount } from "@/lib/amount";
import { SUPPORTED_TOKENS, type TokenConfig } from "@/lib/tokens";

function BalanceRow({ token }: { token: TokenConfig }) {
  const { handle } = useConfidentialBalanceHandle(token.address);
  const { value, isRevealing, isRevealed, reveal } = useDecryptedHandle(handle, token.address);

  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-ink-900/[0.06] bg-paper-50 p-5">
      <p className="text-xs uppercase tracking-wide text-ink-500">{token.symbol}</p>
      <RevealAmount
        status={isRevealed ? "revealed" : isRevealing ? "decrypting" : "masked"}
        value={isRevealed && value !== undefined ? formatAmount(value) : undefined}
        symbol={token.symbol}
        onDecrypt={reveal}
        className="gap-3"
      />
    </div>
  );
}

// Same gate AdminHeader uses before rendering anything that calls Zama hooks
// (useHasPermit/useGrantPermit/useDecryptValues under useDecryptedHandle),
// calling them before ZamaProvider mounts throws.
export function BalanceCard() {
  const { isConnected, chainId } = useAccount();
  const isZamaReady = useIsZamaReady();
  const isSepolia = chainId === sepolia.id;

  if (!isConnected || !isSepolia || !isZamaReady) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8 text-sm text-ink-500">
          Connect on Sepolia to see your balances.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {SUPPORTED_TOKENS.map((token) => (
        <BalanceRow key={token.id} token={token} />
      ))}
    </div>
  );
}
