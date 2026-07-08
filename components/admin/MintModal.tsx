"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMintConfidential } from "@tokenops/sdk/testnet-faucet/react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useMintVeilToken } from "@/lib/hooks/useMintVeilToken";
import { SUPPORTED_TOKENS, getTokenConfig } from "@/lib/tokens";
import { Check } from "lucide-react";

export function MintModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { push: toast } = useToast();
  const mintCTTT = useMintConfidential();
  const mintVeilToken = useMintVeilToken();
  const [selectedTokenId, setSelectedTokenId] = useState("veil");
  const selectedToken = getTokenConfig(selectedTokenId);

  const handleMintVeil = () => {
    mintVeilToken.mint(1_000_000_000n).then(() => {
      toast({ kind: "success", title: `Minted 1,000 ${selectedToken.symbol}` });
      queryClient.invalidateQueries({ queryKey: ["tokenops-sdk", "testnet-faucet"] });
      onClose();
    }).catch((err) => {
      toast({ kind: "error", title: "Mint failed", description: err.message });
    });
  };

  const handleMintCTTT = () => {
    mintCTTT.mutate(
      { amount: 1_000_000_000n },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["tokenops-sdk", "testnet-faucet"] });
          toast({ kind: "success", title: "Minted 1,000 CTTT" });
          onClose();
        },
        onError: (err) => toast({ kind: "error", title: "Mint failed", description: err.message }),
      },
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="Mint test tokens">
      <p className="mb-4 text-sm text-ink-500">Select a token and mint 1,000 on Sepolia. Open and instant, only gas required.</p>
      <div className="mb-4 flex flex-col gap-2">
        {SUPPORTED_TOKENS.map((token) => (
          <button
            key={token.id}
            onClick={() => setSelectedTokenId(token.id)}
            className={`rounded-lg border-2 px-3 py-2 text-left transition-colors ${selectedTokenId === token.id
                ? "border-accent-600 bg-accent-50"
                : "border-ink-900/[0.06] bg-paper-100 hover:border-accent-600/40"
              }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink-900">{token.symbol}</p>
              </div>
              {selectedTokenId === token.id && <Check className="size-4 text-accent-600" />}
            </div>
          </button>
        ))}
      </div>
      <Button
        className="w-full"
        onClick={selectedToken.id === "veil" ? handleMintVeil : handleMintCTTT}
        isLoading={selectedToken.id === "veil" ? mintVeilToken.isPending : mintCTTT.isPending}
      >
        Mint 1,000 {selectedToken.symbol}
      </Button>
    </Modal>
  );
}
