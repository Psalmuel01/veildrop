"use client";

import type { Address, Hex } from "viem";
import { useHasPermit, useGrantPermit, useDecryptValues } from "@zama-fhe/react-sdk";

/**
 * Permit-gated reveal of a single encrypted `euint64` handle. Decryption
 * requires an EIP-712 permit for the contract the handle belongs to — grant
 * it lazily on first reveal rather than eagerly, so connecting a wallet never
 * triggers an unsolicited signature prompt.
 */
export function useDecryptedHandle(handle: Hex | undefined, contractAddress: Address | undefined) {
  const { data: hasPermit, isLoading: isCheckingPermit } = useHasPermit({
    contractAddresses: contractAddress ? [contractAddress] : [],
  });
  const grantPermit = useGrantPermit();
  const decrypt = useDecryptValues(
    handle && contractAddress ? [{ encryptedValue: handle, contractAddress }] : [],
    { enabled: false },
  );

  async function reveal() {
    if (!hasPermit && contractAddress) {
      await grantPermit.mutateAsync([contractAddress]);
    }
    return decrypt.refetch();
  }

  const value = handle && decrypt.data ? (decrypt.data[handle] as bigint | undefined) : undefined;

  return {
    value,
    isLoading: isCheckingPermit,
    isRevealing: grantPermit.isPending || decrypt.isFetching,
    isRevealed: value !== undefined,
    error: decrypt.error,
    reveal,
  };
}
