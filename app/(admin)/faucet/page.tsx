"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount, useReadContract } from "wagmi";
import { sepolia } from "wagmi/chains";
import { Droplets, Wallet, AlertTriangle, Check } from "lucide-react";
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
import { useMintVeilToken } from "@/lib/hooks/useMintVeilToken";
import { SUPPORTED_TOKENS, VEIL_TOKEN } from "@/lib/tokens";
import { useIsZamaReady } from "@/app/providers";

function BalanceReveal({ tokenAddress, symbol }: { tokenAddress: `0x${string}`; symbol: string }) {
  const { address } = useAccount();
  const { data: ctttHandle, isLoading: isLoadingCttt } = useConfidentialBalance();
  const { data: veilHandle, isLoading: isLoadingVeil } = useReadContract({
    address: VEIL_TOKEN.address,
    abi: [
      {
        type: "function",
        name: "confidentialBalanceOf",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "bytes32" }],
        stateMutability: "view",
      },
    ] as const,
    functionName: "confidentialBalanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && tokenAddress.toLowerCase() === VEIL_TOKEN.address.toLowerCase(),
    },
  });

  const isVctt = tokenAddress.toLowerCase() === VEIL_TOKEN.address.toLowerCase();
  const handle = isVctt ? veilHandle : ctttHandle;
  const isLoadingHandle = isVctt ? isLoadingVeil : isLoadingCttt;

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
  const mintCTTT = useMintConfidential();
  const mintVeilToken = useMintVeilToken();
  const [selectedTokenId, setSelectedTokenId] = useState("veil");

  function invalidateFaucet() {
    queryClient.invalidateQueries({ queryKey: ["tokenops-sdk", "testnet-faucet"] });
  }

  const selectedToken = SUPPORTED_TOKENS.find((t) => t.id === selectedTokenId) || SUPPORTED_TOKENS[0]!;
  const isPending = selectedToken.id === "veil" ? mintVeilToken.isPending : mintCTTT.isPending;

  const handleMintVeil = () => {
    mintVeilToken.mint(1_000_000_000n).then(() => {
      invalidateFaucet();
      toast({ kind: "success", title: `Minted 1,000 ${selectedToken.symbol}` });
    }).catch((err) => {
      toast({ kind: "error", title: "Mint failed", description: err.message });
    });
  };

  const handleMintCTTT = () => {
    mintCTTT.mutate(
      { amount: 1_000_000_000n },
      {
        onSuccess: () => {
          invalidateFaucet();
          toast({ kind: "success", title: "Minted 1,000 CTTT" });
        },
        onError: (err) => toast({ kind: "error", title: "Mint failed", description: err.message }),
      },
    );
  };

  const handleMint = selectedToken.id === "veil" ? handleMintVeil : handleMintCTTT;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Droplets className="size-5 text-accent-600" />
          <CardTitle>Testnet faucet</CardTitle>
        </div>
        <CardDescription>Open and permissionless on Sepolia. Mint confidential tokens to fund distributions.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        <div>
          <p className="mb-3 text-sm font-medium text-ink-900">Select token</p>
          <div className="flex flex-col gap-2">
            {SUPPORTED_TOKENS.map((token) => (
              <button
                key={token.id}
                onClick={() => setSelectedTokenId(token.id)}
                className={`rounded-lg border-2 px-4 py-3 text-left transition-colors ${selectedTokenId === token.id
                    ? "border-accent-600 bg-accent-50"
                    : "border-ink-900/[0.06] bg-paper-100 hover:border-accent-600/40"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-ink-900">{token.symbol}</p>
                    <p className="text-xs text-ink-500">{token.name}</p>
                  </div>
                  {selectedTokenId === token.id && <Check className="size-5 text-accent-600" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-paper-100 py-8">
          <BalanceReveal tokenAddress={selectedToken.address} symbol={selectedToken.symbol} />
        </div>

        <Button
          onClick={handleMint}
          isLoading={isPending}
        >
          Mint 1,000 {selectedToken.symbol}
        </Button>
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
