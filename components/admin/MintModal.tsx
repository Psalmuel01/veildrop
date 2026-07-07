"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useFaucetMetadata, useMintConfidential } from "@tokenops/sdk/testnet-faucet/react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function MintModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { push: toast } = useToast();
  const { data: meta } = useFaucetMetadata();
  const mint = useMintConfidential();

  return (
    <Modal open={open} onClose={onClose} title="Mint test tokens">
      <p className="mb-5 text-sm text-ink-500">
        Mint confidential CTTT on Sepolia. Open and instant, only gas required.
      </p>
      <Button
        className="w-full"
        onClick={() =>
          mint.mutate(
            { amount: 1_000_000_000n },
            {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["tokenops-sdk", "testnet-faucet"] });
                toast({ kind: "success", title: "Minted 1,000 CTTT" });
                onClose();
              },
              onError: (err) => toast({ kind: "error", title: "Mint failed", description: err.message }),
            },
          )
        }
        isLoading={mint.isPending}
      >
        Mint 1,000 {meta?.confidential.symbol ?? "CTTT"}
      </Button>
      <Link
        href="/faucet"
        onClick={onClose}
        className="mt-3 block text-center text-xs text-ink-500 hover:text-ink-900"
      >
        More options on the faucet page
      </Link>
    </Modal>
  );
}
