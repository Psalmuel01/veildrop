"use client";

import { useState } from "react";
import { Lock, ChevronDown, Check } from "lucide-react";
import { useConfidentialBalance } from "@tokenops/sdk/testnet-faucet/react";
import { useAccount, useReadContract } from "wagmi";
import { useDecryptedHandle } from "@/lib/hooks/useDecryptedHandle";
import { formatAmount } from "@/lib/amount";
import { cn } from "@/lib/cn";
import { SUPPORTED_TOKENS, VEIL_TOKEN } from "@/lib/tokens";

export function BalanceWidget() {
  const { address } = useAccount();
  const [selectedTokenId, setSelectedTokenId] = useState("veil");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedToken = SUPPORTED_TOKENS.find((t) => t.id === selectedTokenId) || VEIL_TOKEN;

  // 1. Fetch CTTT balance handle
  const { data: ctttHandle } = useConfidentialBalance();

  // 2. Fetch vCTT balance handle
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
      enabled: !!address && selectedTokenId === "veil",
    },
  });

  const handle = selectedTokenId === "veil" ? veilHandle : ctttHandle;

  const { value, isRevealing, isRevealed, reveal } = useDecryptedHandle(handle, selectedToken.address);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen((o) => !o);
  };

  return (
    <div className="relative flex items-center rounded-full border border-ink-900/[0.08] bg-paper-50 font-mono text-xs text-ink-700">
      {/* Balance display / click-to-reveal */}
      <button
        onClick={reveal}
        disabled={isRevealed || isRevealing || !handle}
        className={cn(
          "flex h-9 items-center gap-1.5 px-3 py-1 hover:text-ink-900 transition-colors disabled:pointer-events-none rounded-l-full",
          !isRevealed && "hover:bg-ink-900/5",
        )}
        title={isRevealed ? "Your confidential balance" : "Click to reveal your balance"}
      >
        {isRevealed ? (
          <span className="text-ink-900">
            {formatAmount(value!)}
          </span>
        ) : (
          <div className="flex items-center gap-1.5">
            <Lock className="size-3" />
            <span className="encrypted-mask">••••</span>
            {isRevealing && <span className="text-ink-500 text-[10px]">revealing</span>}
          </div>
        )}
      </button>

      {/* Divider */}
      <div className="h-4 w-px bg-ink-900/[0.08]" />

      {/* Token Selector Dropdown trigger */}
      <button
        onClick={toggleDropdown}
        className="flex h-9 items-center gap-1 rounded-r-full px-2.5 hover:bg-ink-900/5 hover:text-ink-900 transition-colors"
      >
        <span>{selectedToken.symbol}</span>
        <ChevronDown className="size-3 text-ink-500" />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <>
          {/* Overlay to close dropdown */}
          <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1.5 w-40 rounded-xl border border-ink-900/[0.06] bg-paper-100 p-1 shadow-lg backdrop-blur-md">
            {SUPPORTED_TOKENS.map((token) => (
              <button
                key={token.id}
                onClick={() => {
                  setSelectedTokenId(token.id);
                  setDropdownOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs text-ink-700 hover:bg-ink-900/5 hover:text-ink-900 transition-colors"
              >
                <span>{token.symbol}</span>
                {selectedTokenId === token.id && <Check className="size-3 text-accent-600" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
