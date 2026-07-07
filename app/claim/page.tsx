"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { sepolia } from "wagmi/chains";
import { ShieldCheck, ShieldAlert, CheckCircle2, ExternalLink, Wallet, AlertTriangle } from "lucide-react";
import type { Hex } from "viem";
import { useClaim, useGetClaimAmount, useAirdropIsSignatureClaimed } from "@tokenops/sdk/fhe-airdrop/react";
import { useFaucetMetadata } from "@tokenops/sdk/testnet-faucet/react";
import { WalletButton } from "@/components/WalletButton";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { RevealAmount } from "@/components/RevealAmount";
import { useToast } from "@/components/ui/Toast";
import { useDecryptedHandle } from "@/lib/hooks/useDecryptedHandle";
import { useIsZamaReady } from "@/app/providers";
import { decodeClaimPayload, type ClaimPayload } from "@/lib/claim-link";
import { formatAmount } from "@/lib/amount";

const SEPOLIA_EXPLORER = "https://sepolia.etherscan.io/tx/";

function ErrorState({ title, message }: { title: string; message: string }) {
  return (
    <Card className="mx-auto max-w-md">
      <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
        <ShieldAlert className="size-8 text-error-600" />
        <p className="font-display text-lg font-semibold text-ink-900">{title}</p>
        <p className="text-sm text-ink-500">{message}</p>
      </CardContent>
    </Card>
  );
}

/**
 * Every hook here (directly or via useDecryptedHandle) needs a live
 * ZamaProvider, which only mounts once the wallet is connected on Sepolia —
 * so this must only ever be rendered on that happy path, never at the top of
 * ClaimPortalContent (rules of hooks would still fire useZamaSDK internally
 * even inside a branch that isn't shown, since the component itself mounts).
 */
function ClaimActions({ payload, tokenSymbol }: { payload: ClaimPayload; tokenSymbol: string }) {
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

  useEffect(() => {
    if (viewHandle && !decrypted.isRevealed && !decrypted.isRevealing) {
      decrypted.reveal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewHandle]);

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
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["tokenops-sdk", "fhe-airdrop"] });
          toast({ kind: "success", title: "Claimed — tokens are in your wallet" });
        },
        onError: (err) => toast({ kind: "error", title: "Claim failed", description: err.message }),
      },
    );
  }

  const revealStatus = decrypted.isRevealed
    ? "revealed"
    : getClaimAmount.isPending || decrypted.isRevealing
      ? "decrypting"
      : "masked";

  return (
    <>
      <RevealAmount
        status={revealStatus}
        value={decrypted.value !== undefined ? formatAmount(decrypted.value) : undefined}
        symbol={tokenSymbol}
        onDecrypt={handleDecryptClick}
      />

      <div className="border-t border-ink-900/8 pt-6">
        {isCheckingClaimed ? (
          <Skeleton className="h-11 w-full" />
        ) : isClaimed ? (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-success-100 py-3 text-sm font-medium text-success-700">
            <CheckCircle2 className="size-4" />
            Claimed to your wallet
          </div>
        ) : (
          <Button size="lg" className="w-full" onClick={handleClaim} isLoading={claim.isPending}>
            {claim.isPending ? "Claiming…" : "Claim tokens to my wallet"}
          </Button>
        )}
        {claim.isSuccess && (
          <a
            href={`${SEPOLIA_EXPLORER}${claim.data}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-500 hover:text-ink-900"
          >
            View transaction
            <ExternalLink className="size-3" />
          </a>
        )}
      </div>
    </>
  );
}

function ClaimPortalContent() {
  const searchParams = useSearchParams();
  const { address, isConnected, chainId } = useAccount();
  const isSepolia = chainId === sepolia.id;
  const isZamaReady = useIsZamaReady();
  const { data: meta } = useFaucetMetadata();

  const encoded = searchParams.get("payload");
  const payload = encoded ? decodeClaimPayload(encoded) : null;

  if (!payload) {
    return (
      <ErrorState
        title="Invalid claim link"
        message="This link looks incomplete or corrupted. Ask the sender to resend it."
      />
    );
  }

  const wrongWallet = isConnected && !!address && address.toLowerCase() !== payload.recipient.toLowerCase();

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-accent-100 text-accent-700">
          <ShieldCheck className="size-6" />
        </div>
        <h1 className="font-display text-2xl font-bold text-ink-900">
          You&apos;ve been sent a confidential allocation
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          Only you can reveal the amount. It was encrypted before it ever touched the chain.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-8 py-10">
          {!isConnected ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <Wallet className="size-8 text-ink-500" />
              <p className="text-sm text-ink-700">Connect your wallet to view and claim your allocation.</p>
              <WalletButton />
            </div>
          ) : !isSepolia ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <AlertTriangle className="size-8 text-error-600" />
              <p className="text-sm text-ink-700">Switch to Sepolia to continue.</p>
              <WalletButton />
            </div>
          ) : wrongWallet ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <ShieldAlert className="size-8 text-error-600" />
              <p className="text-sm text-ink-700">
                This allocation was sent to a different wallet.
                <br />
                <span className="font-mono text-xs text-ink-500">{payload.recipient}</span>
              </p>
              <WalletButton />
            </div>
          ) : !isZamaReady ? (
            <Skeleton className="h-72 w-full" />
          ) : (
            <ClaimActions payload={payload} tokenSymbol={meta?.confidential.symbol ?? "CTTT"} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ClaimPage() {
  return (
    <div className="min-h-screen bg-paper-100">
      <main className="px-5 py-16 sm:px-8">
        <Suspense
          fallback={
            <div className="mx-auto max-w-lg">
              <Skeleton className="h-96 w-full" />
            </div>
          }
        >
          <ClaimPortalContent />
        </Suspense>
      </main>
    </div>
  );
}
