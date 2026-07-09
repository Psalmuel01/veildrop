"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { sepolia } from "wagmi/chains";
import { ShieldCheck, ShieldAlert, Wallet, AlertTriangle } from "lucide-react";
import { useFaucetMetadata } from "@tokenops/sdk/testnet-faucet/react";
import { WalletButton } from "@/components/WalletButton";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ClaimFlow } from "@/components/claim/ClaimFlow";
import { useIsZamaReady } from "@/app/providers";
import { decodeClaimPayload } from "@/lib/claim-link";

function ErrorState({ title, message }: { title: string; message: string }) {
  return (
    <Card className="mx-auto max-w-md">
      <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
        <ShieldAlert className="size-8 text-error-600" />
        <p className="font-display text-lg font-bold text-ink-900">{title}</p>
        <p className="text-sm text-ink-500">{message}</p>
      </CardContent>
    </Card>
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
            <ClaimFlow payload={payload} tokenSymbol={meta?.confidential.symbol ?? "CTTT"} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ClaimPage() {
  return (
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
  );
}
