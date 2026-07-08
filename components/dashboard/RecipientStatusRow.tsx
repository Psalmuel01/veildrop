"use client";

import { useEffect } from "react";
import { CheckCircle2, Circle, Copy } from "lucide-react";
import { useAirdropIsSignatureClaimed } from "@tokenops/sdk/fhe-airdrop/react";
import { EncryptedBadge } from "@/components/EncryptedBadge";
import { useToast } from "@/components/ui/Toast";
import { decodeClaimPayload } from "@/lib/claim-link";

export function RecipientStatusRow({
  address,
  claimUrl,
  onStatus,
}: {
  address: string;
  claimUrl?: string;
  onStatus?: (claimed: boolean) => void;
}) {
  const { push: toast } = useToast();
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
    <div className="flex items-center justify-between gap-3 border-b border-ink-900/[0.04] px-4 py-2.5 last:border-0">
      <span className="truncate font-mono text-xs text-ink-900">{address}</span>
      <div className="flex shrink-0 items-center gap-3">
        <EncryptedBadge className="hidden sm:inline-flex" />
        <span
          className={`flex items-center gap-1 text-xs font-medium ${isClaimed ? "text-success-700" : "text-ink-500"}`}
        >
          {isClaimed ? <CheckCircle2 className="size-3.5" /> : <Circle className="size-3.5" />}
          {isClaimed ? "Claimed" : "Pending"}
        </span>
        {claimUrl && !isClaimed && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(claimUrl);
              toast({ kind: "success", title: "Claim link copied" });
            }}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-accent-600 hover:bg-accent-100"
          >
            <Copy className="size-3" />
            Copy link
          </button>
        )}
      </div>
    </div>
  );
}
