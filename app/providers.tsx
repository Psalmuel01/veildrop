"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { WagmiProvider, useAccount, usePublicClient, useWalletClient } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ZamaProvider } from "@zama-fhe/react-sdk";
import { wagmiConfig } from "@/lib/wagmi";
import { buildZamaConfig } from "@/lib/zama";
import { ToastProvider } from "@/components/ui/Toast";

const ZamaReadyContext = createContext(false);

/**
 * True only once <ZamaProvider> is actually mounted below. Components that
 * call Zama hooks (useZamaSDK, useHasPermit, useDecryptValues, ...) must gate
 * on this, not on `isConnected && chainId === sepolia.id` from their own
 * useAccount() call, which can be true a render or two before walletClient
 * (and therefore ZamaProvider) is ready, throwing "must be used within a
 * ZamaProvider".
 */
export function useIsZamaReady() {
  return useContext(ZamaReadyContext);
}

function ZamaProviderGate({ children }: { children: ReactNode }) {
  const { address, chainId } = useAccount();
  const isSepolia = chainId === sepolia.id;
  const publicClient = usePublicClient({ chainId: sepolia.id });
  const { data: walletClient } = useWalletClient({ chainId: sepolia.id, query: { enabled: isSepolia } });

  const zamaConfig = useMemo(() => {
    if (!isSepolia || !publicClient || !walletClient) return null;
    return buildZamaConfig(publicClient, walletClient);
  }, [isSepolia, publicClient, walletClient]);

  if (!zamaConfig) {
    return <ZamaReadyContext.Provider value={false}>{children}</ZamaReadyContext.Provider>;
  }

  return (
    <ZamaProvider key={`${address}-${chainId}`} config={zamaConfig}>
      <ZamaReadyContext.Provider value={true}>{children}</ZamaReadyContext.Provider>
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
