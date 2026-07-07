"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { sepolia } from "wagmi/chains";
import { ChevronDown, LogOut, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

function truncate(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function WalletButton() {
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [open, setOpen] = useState(false);

  if (!isConnected) {
    const injected = connectors.find((c) => c.id === "injected") ?? connectors[0];
    return (
      <Button onClick={() => injected && connect({ connector: injected })} isLoading={isPending}>
        <Wallet className="size-4" />
        Connect wallet
      </Button>
    );
  }

  const isSepolia = chainId === sepolia.id;

  if (!isSepolia) {
    return (
      <Button variant="danger" onClick={() => switchChain({ chainId: sepolia.id })} isLoading={isSwitching}>
        Switch to Sepolia
      </Button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-ink-900/15 bg-paper-50 px-3.5 text-sm text-ink-900 transition-colors hover:border-ink-900/30"
      >
        <span className="size-2 rounded-full bg-success-600" />
        <span className="font-mono">{truncate(address!)}</span>
        <ChevronDown className={cn("size-3.5 text-ink-500 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-lg border border-ink-900/10 bg-paper-50 shadow-[0_8px_30px_-8px_rgba(28,24,17,0.25)]">
            <button
              onClick={() => {
                disconnect();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3.5 py-2.5 text-sm text-ink-700 hover:bg-ink-900/5"
            >
              <LogOut className="size-3.5" />
              Disconnect
            </button>
          </div>
        </>
      )}
    </div>
  );
}
