"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { ArrowRight, Sparkles } from "lucide-react";
import { getPendingRecipients, type PendingRecipient } from "@/lib/api";

export function PendingBanner() {
  const { address } = useAccount();
  const [pending, setPending] = useState<PendingRecipient[]>([]);

  useEffect(() => {
    if (!address) {
      setPending([]);
      return;
    }
    let cancelled = false;
    getPendingRecipients(address)
      .then((result) => {
        if (!cancelled) setPending(result);
      })
      .catch(() => null);
    return () => {
      cancelled = true;
    };
  }, [address]);

  if (pending.length === 0) return null;

  return (
    <Link
      href="/received"
      className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-accent-600/30 bg-accent-100 px-4 py-2 text-sm font-medium text-accent-600 transition-colors hover:border-accent-600/60"
    >
      <Sparkles className="size-4" />
      You have {pending.length} pending distribution{pending.length !== 1 ? "s" : ""} waiting. View and claim.
      <ArrowRight className="size-3.5" />
    </Link>
  );
}
