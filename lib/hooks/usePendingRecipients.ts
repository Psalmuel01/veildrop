"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { getPendingRecipients } from "@/lib/api";

/**
 * Shared so the recipient header's badge and the pending-claims card on
 * /received don't each fire their own fetch and transiently disagree while
 * both resolve, react-query dedupes identical query keys automatically.
 */
export function usePendingRecipients() {
  const { address } = useAccount();
  return useQuery({
    queryKey: ["pending-recipients", address],
    queryFn: () => getPendingRecipients(address!),
    enabled: !!address,
  });
}
