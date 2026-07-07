import { createConfig, http } from "wagmi";
import { sepolia, mainnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const SEPOLIA_RPC_URL =
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com";

export const wagmiConfig = createConfig({
  chains: [sepolia, mainnet],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(SEPOLIA_RPC_URL),
    [mainnet.id]: http(),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
