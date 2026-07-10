"use client";

import type { Address, Hex } from "viem";
import { CheckCircle2, Clock3 } from "lucide-react";
import { useVestingInfo } from "@tokenops/sdk/fhe-vesting/react";
import { EncryptedBadge } from "@/components/EncryptedBadge";
import { VestingScheduleTimeline } from "@/components/distribute/VestingScheduleTimeline";

// Admin never decrypts a recipient's vesting amounts here, same privacy
// discipline as RecipientStatusRow on the airdrop side. Only plain,
// non-encrypted schedule metadata (timestamps) is read directly.
export function RecipientVestingRow({
  address,
  vestingId,
  managerAddress,
  totalClaimedAmount,
}: {
  address: string;
  vestingId: string | null;
  managerAddress: Address;
  totalClaimedAmount: string | null;
}) {
  const { data: info } = useVestingInfo({
    address: managerAddress,
    vestingId: vestingId as Hex | undefined,
  });

  const now = Math.floor(Date.now() / 1000);
  const inCliff = !!info && now < info.cliffReleaseTimestamp;
  const finished = !!info && now >= info.endTimestamp;

  return (
    <div className="flex flex-col gap-2 border-b border-ink-900/[0.04] px-4 py-2.5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="truncate font-mono text-xs text-ink-900">{address}</span>
        <EncryptedBadge className="hidden sm:inline-flex" />
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {info && (
          <div className="w-32">
            <VestingScheduleTimeline
              startTimestamp={info.startTimestamp}
              cliffSeconds={Math.max(info.cliffReleaseTimestamp - info.startTimestamp, 0)}
              vestingSeconds={Math.max(info.endTimestamp - info.cliffReleaseTimestamp, 0)}
              compact
            />
          </div>
        )}
        <span className="flex items-center gap-1 text-xs font-medium text-ink-500">
          {finished ? (
            <>
              <CheckCircle2 className="size-3.5 text-success-600" />
              Fully vested
            </>
          ) : inCliff ? (
            <>
              <Clock3 className="size-3.5" />
              In cliff
            </>
          ) : (
            <>
              <Clock3 className="size-3.5 text-accent-600" />
              Unlocking
            </>
          )}
        </span>
        {totalClaimedAmount && <span className="size-1.5 rounded-full bg-success-600" title="Has claimed" />}
      </div>
    </div>
  );
}
