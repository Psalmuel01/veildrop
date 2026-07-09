"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { sepolia } from "wagmi/chains";
import { ShieldCheck, ShieldAlert, Wallet, AlertTriangle } from "lucide-react";
import { WalletButton } from "@/components/WalletButton";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ClaimFlow } from "@/components/claim/ClaimFlow";
import { useIsZamaReady } from "@/app/providers";
import { decodeClaimPayload, type ClaimPayload } from "@/lib/claim-link";
import { getRecipient, type ApiRecipient, type ApiDistribution } from "@/lib/api";

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

function extractPayload(claimUrl: string | null): ClaimPayload | null {
  if (!claimUrl) return null;
  try {
    const encoded = new URL(claimUrl).searchParams.get("payload");
    return encoded ? decodeClaimPayload(encoded) : null;
  } catch {
    return null;
  }
}

export default function ClaimByIdPage() {
  const params = useParams<{ id: string }>();
  const { address, isConnected, chainId } = useAccount();
  const isSepolia = chainId === sepolia.id;
  const isZamaReady = useIsZamaReady();
  const [recipient, setRecipient] = useState<(ApiRecipient & { distribution: ApiDistribution }) | null | undefined>(
    undefined,
  );

  useEffect(() => {
    getRecipient(params.id)
      .then(setRecipient)
      .catch(() => setRecipient(null));
  }, [params.id]);

  if (recipient === undefined) {
    return (
      <main className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-lg">
          <Skeleton className="h-96 w-full" />
        </div>
      </main>
    );
  }

  const payload = recipient ? extractPayload(recipient.claimUrl) : null;

  if (!recipient || !payload) {
    return (
      <main className="px-5 py-16 sm:px-8">
        <ErrorState
          title="Claim not found"
          message="This claim link doesn't match anything we know about. Ask the sender to resend it."
        />
      </main>
    );
  }

  const wrongWallet = isConnected && !!address && address.toLowerCase() !== payload.recipient.toLowerCase();

  return (
    <main className="px-5 py-16 sm:px-8">
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
              <ClaimFlow
                payload={payload}
                recipientId={recipient.id}
                tokenSymbol={recipient.distribution.tokenSymbol}
                meta={{
                  title: recipient.distribution.title,
                  description: recipient.distribution.description,
                  adminAddress: recipient.distribution.adminAddress,
                  claimWindowEnd: recipient.distribution.claimWindowEnd,
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
