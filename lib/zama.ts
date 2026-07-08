import { createConfig } from "@zama-fhe/sdk/viem";
import { web } from "@zama-fhe/sdk/web";
import { sepolia as sepoliaFhe, type FheChain } from "@zama-fhe/sdk/chains";
import type { PublicClient, WalletClient } from "viem";
import { SEPOLIA_RPC_URL } from "./wagmi";

export const sepoliaFheChain = {
  ...sepoliaFhe,
  network: SEPOLIA_RPC_URL,
} as const satisfies FheChain;

/**
 * Built per-connection (not once at module scope) because ZamaConfigViem
 * requires a live walletClient. The signer must be rebuilt whenever the
 * connected account or chain changes, or the relayer signs with a stale key.
 */
export function buildZamaConfig(publicClient: PublicClient, walletClient: WalletClient) {
  return createConfig({
    chains: [sepoliaFheChain],
    publicClient,
    walletClient,
    relayers: { [sepoliaFheChain.id]: web() },
  });
}
