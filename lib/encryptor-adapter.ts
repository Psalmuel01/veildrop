import { hexToBytes } from "viem";
import type { ZamaSDK } from "@zama-fhe/sdk";

/**
 * @tokenops/sdk's `Encryptor` interface expects `{ handles: Uint8Array[],
 * inputProof: Uint8Array }`, but the installed @zama-fhe/sdk@3.2.0
 * `RelayerDispatcher`/`RelayerWeb`.encrypt() returns
 * `{ encryptedValues: Hex[], inputProof: Hex }` — a real shape mismatch
 * between the two packages' current published versions (their own quickstart
 * examples don't type-check against these versions either). Bridge it here
 * rather than at every call site.
 */
export function toTokenOpsEncryptor(relayer: ZamaSDK["relayer"]) {
  return {
    async encrypt(params: Parameters<ZamaSDK["relayer"]["encrypt"]>[0]) {
      const result = await relayer.encrypt(params);
      return {
        handles: result.encryptedValues.map((v) => hexToBytes(v)),
        inputProof: hexToBytes(result.inputProof),
      };
    },
  };
}
