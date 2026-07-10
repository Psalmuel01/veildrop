"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { sepolia } from "wagmi/chains";
import { ShieldCheck, ShieldAlert, Wallet, AlertTriangle } from "lucide-react";
import { WalletButton } from "@/components/WalletButton";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { VestingScheduleView } from "@/components/vesting/VestingScheduleView";
import { useIsZamaReady } from "@/app/providers";
import { getVestingSchedule, type VestingScheduleDto } from "@/lib/api";

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

export default function VestingByIdPage() {
  const params = useParams<{ id: string }>();
  const { address, isConnected, chainId } = useAccount();
  const isSepolia = chainId === sepolia.id;
  const isZamaReady = useIsZamaReady();
  const [schedule, setSchedule] = useState<VestingScheduleDto | null | undefined>(undefined);

  const load = useCallback(() => {
    getVestingSchedule(params.id)
      .then(setSchedule)
      .catch(() => setSchedule(null));
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  if (schedule === undefined) {
    return (
      <main className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-lg">
          <Skeleton className="h-96 w-full" />
        </div>
      </main>
    );
  }

  if (!schedule || !schedule.vestingId || !schedule.distribution.contractAddress) {
    return (
      <main className="px-5 py-16 sm:px-8">
        <ErrorState
          title="Vesting schedule not found"
          message="This link doesn't match anything we know about. Ask the sender to resend it."
        />
      </main>
    );
  }

  const wrongWallet = isConnected && !!address && address.toLowerCase() !== schedule.address.toLowerCase();

  return (
    <main className="px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-accent-100 text-accent-700">
            <ShieldCheck className="size-6" />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink-900">{schedule.distribution.title}</h1>
          <p className="mt-2 text-sm text-ink-500">
            Your allocation unlocks gradually. Only you can reveal how much is currently claimable.
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col gap-8 py-10">
            {!isConnected ? (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <Wallet className="size-8 text-ink-500" />
                <p className="text-sm text-ink-700">Connect your wallet to view your vesting schedule.</p>
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
                  This allocation belongs to a different wallet.
                  <br />
                  <span className="font-mono text-xs text-ink-500">{schedule.address}</span>
                </p>
                <WalletButton />
              </div>
            ) : !isZamaReady ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <VestingScheduleView
                recipientId={schedule.id}
                managerAddress={schedule.distribution.contractAddress as `0x${string}`}
                vestingId={schedule.vestingId as `0x${string}`}
                tokenSymbol={schedule.distribution.tokenSymbol}
                totalClaimedAmount={schedule.totalClaimedAmount}
                claims={schedule.vestingClaims}
                onClaimed={load}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
