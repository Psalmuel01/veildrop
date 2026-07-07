"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { sepolia } from "wagmi/chains";
import { Droplets, Wallet, AlertTriangle } from "lucide-react";
import {
  useFaucetMetadata,
  useConfidentialBalance,
  useMintConfidential,
} from "@tokenops/sdk/testnet-faucet/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { WalletButton } from "@/components/WalletButton";
import { RevealAmount } from "@/components/RevealAmount";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { formatAmount } from "@/lib/amount";
import { useDecryptedHandle } from "@/lib/hooks/useDecryptedHandle";
import { useIsZamaReady } from "@/app/providers";

function BalanceReveal({ tokenAddress, symbol }: { tokenAddress: `0x${string}`; symbol: string }) {
  const { data: handle, isLoading: isLoadingHandle } = useConfidentialBalance();
  const { value, isLoading, isRevealing, isRevealed, reveal } = useDecryptedHandle(handle, tokenAddress);

  if (isLoadingHandle || isLoading) {
    return <Skeleton className="mx-auto h-24 w-64" />;
  }

  const status = isRevealed ? "revealed" : isRevealing ? "decrypting" : "masked";

  return (
    <RevealAmount
      status={status}
      value={value !== undefined ? formatAmount(value) : undefined}
      symbol={symbol}
      onDecrypt={reveal}
    />
  );
}

function FaucetPanel() {
  const queryClient = useQueryClient();
  const { push: toast } = useToast();
  const { data: meta, isLoading: isLoadingMeta } = useFaucetMetadata();
  const mintConfidential = useMintConfidential();

  function invalidateFaucet() {
    queryClient.invalidateQueries({ queryKey: ["tokenops-sdk", "testnet-faucet"] });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Droplets className="size-5 text-accent-600" />
          <CardTitle>Testnet faucet</CardTitle>
        </div>
        <CardDescription>Open and permissionless on Sepolia. Mint confidential CTTT to fund distributions.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        {isLoadingMeta || !meta ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <>
            <div className="rounded-2xl bg-paper-100 py-8">
              <BalanceReveal tokenAddress={meta.confidential.address} symbol={meta.confidential.symbol} />
            </div>

            <Button
              onClick={() =>
                mintConfidential.mutate(
                  { amount: 1_000_000_000n },
                  {
                    onSuccess: () => {
                      invalidateFaucet();
                      toast({ kind: "success", title: "Minted 1,000 CTTT" });
                    },
                    onError: (err) => toast({ kind: "error", title: "Mint failed", description: err.message }),
                  },
                )
              }
              isLoading={mintConfidential.isPending}
            >
              Mint 1,000 {meta.confidential.symbol}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function FaucetPage() {
  const { isConnected, chainId } = useAccount();
  const isSepolia = chainId === sepolia.id;
  const isZamaReady = useIsZamaReady();

  return (
    <main className="mx-auto max-w-lg px-5 py-16 sm:px-8">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-ink-900">
          Faucet<span className="text-accent-600">.</span>
        </h1>
        <p className="mt-2 text-sm text-ink-500">Testnet only. Never available on mainnet.</p>
      </div>

      {!isConnected ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <Wallet className="size-8 text-ink-500" />
            <p className="text-sm text-ink-700">Connect your wallet to mint test tokens.</p>
            <WalletButton />
          </CardContent>
        </Card>
      ) : !isSepolia ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <AlertTriangle className="size-8 text-error-600" />
            <p className="text-sm text-ink-700">The faucet only runs on Sepolia testnet.</p>
            <WalletButton />
          </CardContent>
        </Card>
      ) : !isZamaReady ? (
        <Card>
          <CardContent className="py-12">
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ) : (
        <FaucetPanel />
      )}
    </main>
  );
}
