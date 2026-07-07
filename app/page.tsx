"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { sepolia } from "wagmi/chains";
import { useHasPermit, useGrantPermit, useDecryptValues } from "@zama-fhe/react-sdk";
import {
  useFaucetMetadata,
  useConfidentialBalance,
  useMintConfidential,
} from "@tokenops/sdk/testnet-faucet/react";
import { formatAmount } from "@/lib/amount";

function DecryptedBalance({ tokenAddress }: { tokenAddress: `0x${string}` }) {
  const { data: handle, isLoading: isLoadingHandle } = useConfidentialBalance();
  const { data: hasPermit, isLoading: isCheckingPermit } = useHasPermit({
    contractAddresses: [tokenAddress],
  });
  const grantPermit = useGrantPermit();
  const decrypt = useDecryptValues(
    handle ? [{ encryptedValue: handle, contractAddress: tokenAddress }] : [],
    { enabled: !!handle && !!hasPermit },
  );

  if (isLoadingHandle || isCheckingPermit) return <p>Loading balance…</p>;
  if (!handle) return <p>No balance yet.</p>;

  if (!hasPermit) {
    return (
      <button onClick={() => grantPermit.mutate([tokenAddress])} disabled={grantPermit.isPending}>
        {grantPermit.isPending ? "Signing…" : "Authorize decrypt"}
      </button>
    );
  }

  if (decrypt.isLoading) return <p>Decrypting…</p>;
  if (decrypt.error) return <p>Decrypt failed: {decrypt.error.message}</p>;

  const clear = decrypt.data?.[handle];
  return <p>Balance: {clear !== undefined ? formatAmount(clear as bigint) : "—"} CTTT</p>;
}

function FaucetPanel() {
  const queryClient = useQueryClient();
  const { data: meta } = useFaucetMetadata();
  const mint = useMintConfidential();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {meta && (
        <p>
          {meta.confidential.symbol} · {meta.confidential.decimals} decimals · rate{" "}
          {meta.rate.toString()}
        </p>
      )}
      <button
        onClick={() =>
          mint.mutate(
            { amount: 1_000_000_000n },
            {
              onSuccess: () =>
                queryClient.invalidateQueries({ queryKey: ["tokenops-sdk", "testnet-faucet"] }),
            },
          )
        }
        disabled={mint.isPending}
      >
        {mint.isPending ? "Minting…" : "Mint 1,000 CTTT"}
      </button>
      {mint.isError && <p>Mint failed: {mint.error.message}</p>}
      {mint.isSuccess && <p>Minted! tx: {mint.data.hash}</p>}
      {meta && <DecryptedBalance tokenAddress={meta.confidential.address} />}
    </div>
  );
}

export default function Home() {
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <main style={{ padding: 32, fontFamily: "sans-serif" }}>
      <h1>VeilDrop — dev harness</h1>

      {!isConnected ? (
        <div style={{ display: "flex", gap: 8 }}>
          {connectors.map((connector) => (
            <button key={connector.uid} onClick={() => connect({ connector })} disabled={isConnecting}>
              Connect {connector.name}
            </button>
          ))}
        </div>
      ) : (
        <div>
          <p>Connected: {address}</p>
          <p>
            Chain: {chainId} {chainId !== sepolia.id && "(switch to Sepolia)"}
          </p>
          <button onClick={() => disconnect()}>Disconnect</button>
        </div>
      )}

      {isConnected && chainId === sepolia.id && <FaucetPanel />}
    </main>
  );
}
