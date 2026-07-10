"use client";

import type { Address } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { useConfidentialBalance } from "@tokenops/sdk/testnet-faucet/react";
import { VEIL_TOKEN } from "@/lib/tokens";

/**
 * Reads the connected wallet's encrypted balance handle for a supported
 * token. CTTT (TokenOps' test token) exposes it via the SDK's own hook;
 * VEIL_TOKEN (VeilDrop's own deployed token) is read directly off the
 * contract, since it isn't the SDK's default token. Both are free view
 * calls, never a mutation, decrypting the returned handle (see
 * useDecryptedHandle) is what requires an explicit reveal action.
 */
export function useConfidentialBalanceHandle(tokenAddress: Address | undefined) {
  const { address } = useAccount();
  const { data: ctttHandle } = useConfidentialBalance();

  const isVctt = !!tokenAddress && tokenAddress.toLowerCase() === VEIL_TOKEN.address.toLowerCase();

  const { data: veilHandle } = useReadContract({
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
      enabled: !!address && isVctt,
    },
  });

  return { handle: isVctt ? veilHandle : ctttHandle };
}
