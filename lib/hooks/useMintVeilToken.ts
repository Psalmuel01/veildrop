"use client";

import { useCallback, useRef } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { VEIL_TOKEN } from "@/lib/tokens";

const VEIL_TOKEN_ABI = [
    {
        type: "function",
        name: "mintConfidential",
        inputs: [
            { name: "to", type: "address" },
            { name: "amount", type: "uint64" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
] as const;

export function useMintVeilToken() {
    const { address } = useAccount();
    const txHashRef = useRef<`0x${string}` | undefined>();
    const { writeContractAsync, isPending } = useWriteContract();
    const { isLoading: isConfirming } = useWaitForTransactionReceipt({
        hash: txHashRef.current,
    });

    const mint = useCallback(
        async (amount: bigint) => {
            if (!address) throw new Error("Wallet not connected");

            try {
                const hash = await writeContractAsync({
                    address: VEIL_TOKEN.address,
                    abi: VEIL_TOKEN_ABI,
                    functionName: "mintConfidential",
                    args: [address, BigInt(Math.floor(Number(amount)))],
                });
                txHashRef.current = hash;
                return hash;
            } catch (error) {
                throw error;
            }
        },
        [address, writeContractAsync]
    );

    return {
        mint,
        isPending: isPending || isConfirming,
    };
}
