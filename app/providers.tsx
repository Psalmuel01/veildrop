"use client";

import { useMemo, useState, type ReactNode } from "react";
import { WagmiProvider, useAccount, usePublicClient, useWalletClient } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ZamaProvider } from "@zama-fhe/react-sdk";
import { wagmiConfig } from "@/lib/wagmi";
import { buildZamaConfig } from "@/lib/zama";
import { ToastProvider } from "@/components/ui/Toast";

/**
 * ZamaConfigViem requires a live walletClient bound to Sepolia, so this only
 * mounts once a wallet is connected to the right chain. Rebuilding on every
 * account/chain change (rather than once at module scope) avoids signing
 * with a stale keypair after a wallet switch.
 */
function ZamaProviderGate({ children }: { children: ReactNode }) {
  const { address, chainId } = useAccount();
  const isSepolia = chainId === sepolia.id;
  const publicClient = usePublicClient({ chainId: sepolia.id });
  const { data: walletClient } = useWalletClient({ chainId: sepolia.id, query: { enabled: isSepolia } });

  const zamaConfig = useMemo(() => {
    if (!isSepolia || !publicClient || !walletClient) return null;
    return buildZamaConfig(publicClient, walletClient);
  }, [isSepolia, publicClient, walletClient]);

  if (!zamaConfig) return <>{children}</>;

  return (
    <ZamaProvider key={`${address}-${chainId}`} config={zamaConfig}>
      {children}
    </ZamaProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ZamaProviderGate>
          <ToastProvider>{children}</ToastProvider>
        </ZamaProviderGate>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
