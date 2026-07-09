"use client";

import { useEffect } from "react";
import { CheckCircle2, Circle, BellOff, BellRing } from "lucide-react";
import { useAirdropIsSignatureClaimed } from "@tokenops/sdk/fhe-airdrop/react";
import { EncryptedBadge } from "@/components/EncryptedBadge";
import { ShareClaimLink } from "@/components/claim/ShareClaimLink";
import { decodeClaimPayload } from "@/lib/claim-link";

export function RecipientStatusRow({
  id,
  address,
  claimUrl,
  notifiedAt,
  onStatus,
}: {
  id?: string;
  address: string;
  claimUrl?: string;
  notifiedAt?: string | null;
  onStatus?: (claimed: boolean) => void;
}) {
  const payload = claimUrl ? decodeClaimPayload(new URL(claimUrl).searchParams.get("payload") ?? "") : null;

  const { data: isClaimed } = useAirdropIsSignatureClaimed({
    address: payload?.airdrop ?? "0x0000000000000000000000000000000000000000",
    user: payload?.recipient,
    encryptedAmountHandle: payload?.handle,
  });

  useEffect(() => {
    if (isClaimed !== undefined) onStatus?.(isClaimed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClaimed]);

  return (
    <div className="flex flex-col gap-2 border-b border-ink-900/[0.04] px-4 py-2.5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="truncate font-mono text-xs text-ink-900">{address}</span>
        <span
          className={`flex items-center gap-1 text-[11px] ${notifiedAt ? "text-ink-500" : "text-amber-600"}`}
          title={notifiedAt ? `Notified ${new Date(notifiedAt).toLocaleString()}` : "Not yet notified"}
        >
          {notifiedAt ? <BellOff className="size-3" /> : <BellRing className="size-3" />}
          {notifiedAt ? "Notified" : "Not yet notified"}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <EncryptedBadge className="hidden sm:inline-flex" />
        <span
          className={`flex items-center gap-1 text-xs font-medium ${isClaimed ? "text-success-700" : "text-ink-500"}`}
        >
          {isClaimed ? <CheckCircle2 className="size-3.5" /> : <Circle className="size-3.5" />}
          {isClaimed ? "Claimed" : "Pending"}
        </span>
        {claimUrl && !isClaimed && <ShareClaimLink url={claimUrl} recipientId={id} />}
      </div>
    </div>
  );
}
