"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { useZamaSDK, useConfidentialIsOperator, useConfidentialSetOperator } from "@zama-fhe/react-sdk";
import { useCreateAndFundConfidentialAirdropAndGetAddress, useSignClaimAuthorization } from "@tokenops/sdk/fhe-airdrop/react";
import { encryptUint64 } from "@tokenops/sdk/fhe-airdrop";
import { getFheAirdropFactoryAddress } from "@tokenops/sdk";
import type { Address } from "viem";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { BalanceCheck } from "@/components/distribute/BalanceCheck";
import { formatAmount } from "@/lib/amount";
import { toTokenOpsEncryptor } from "@/lib/encryptor-adapter";
import { buildClaimUrl, type ClaimPayload } from "@/lib/claim-link";
import type { RecipientRow } from "@/lib/recipients";
import type { DistributionConfig } from "@/components/distribute/StepConfigure";

export interface ClaimLinkResult {
  address: string;
  amountDisplay: string;
  url: string;
}

export interface AirdropSuccessResult {
  txHash: string;
  airdropAddress: Address;
  claimLinks: ClaimLinkResult[];
}

function randomSalt(): `0x${string}` {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return `0x${Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;
}

function ChecklistRow({ ok, pending, label, action }: { ok: boolean; pending?: boolean; label: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="flex items-center gap-2 text-sm text-ink-700">
        {pending ? (
          <Loader2 className="size-4 animate-spin text-ink-500" />
        ) : ok ? (
          <CheckCircle2 className="size-4 text-success-600" />
        ) : (
          <Circle className="size-4 text-ink-300" />
        )}
        {label}
      </span>
      {action}
    </div>
  );
}

export function StepReviewAirdrop({
  recipients,
  tokenAddress,
  tokenSymbol,
  config,
  onSuccess,
}: {
  recipients: RecipientRow[];
  tokenAddress: Address;
  tokenSymbol: string;
  config: DistributionConfig;
  onSuccess: (result: AirdropSuccessResult) => void;
}) {
  const queryClient = useQueryClient();
  const { push: toast } = useToast();
  const { address: admin, chainId } = useAccount();
  const zamaSDK = useZamaSDK();
  const [balanceSufficient, setBalanceSufficient] = useState<boolean | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);

  const totalRaw = recipients.reduce((sum, r) => sum + r.amountRaw, 0n);
  const factoryAddress = chainId ? getFheAirdropFactoryAddress(chainId) : undefined;

  const { data: isApproved, isLoading: isCheckingApproval } = useConfidentialIsOperator({
    address: tokenAddress,
    spender: factoryAddress,
    holder: admin,
  });
  const setOperator = useConfidentialSetOperator(tokenAddress);
  const create = useCreateAndFundConfidentialAirdropAndGetAddress({
    encryptor: () => toTokenOpsEncryptor(zamaSDK.relayer),
  });
  const sign = useSignClaimAuthorization();

  const readyToLaunch = !!isApproved && balanceSufficient === true && !!admin && !!factoryAddress;

  async function handleLaunch() {
    if (!admin || !factoryAddress) return;
    setIsLaunching(true);
    try {
      const now = Math.floor(Date.now() / 1000);
      const startTimestamp = config.claimStart ? Math.floor(new Date(config.claimStart).getTime() / 1000) : now + 60;
      const endTimestamp = config.claimEnd ? Math.floor(new Date(config.claimEnd).getTime() / 1000) : now + 30 * 86400;

      const { hash, airdrop } = await create.mutateAsync({
        params: { token: tokenAddress, startTimestamp, endTimestamp, canExtendClaimWindow: true, admin },
        userSalt: randomSalt(),
        amount: totalRaw,
      });
      queryClient.invalidateQueries({ queryKey: ["tokenops-sdk", "fhe-airdrop"] });

      const claimLinks: ClaimLinkResult[] = [];
      const encryptor = toTokenOpsEncryptor(zamaSDK.relayer);
      for (let i = 0; i < recipients.length; i++) {
        const row = recipients[i]!;
        setProgress({ current: i + 1, total: recipients.length });
        const recipientAddress = row.address as Address;

        const encrypted = await encryptUint64({
          encryptor,
          contractAddress: airdrop,
          userAddress: recipientAddress,
          value: row.amountRaw,
        });
        const signature = await sign.mutateAsync({
          airdropAddress: airdrop,
          recipient: recipientAddress,
          encryptedAmountHandle: encrypted.handle,
        });

        const payload: ClaimPayload = {
          airdrop,
          recipient: recipientAddress,
          handle: encrypted.handle,
          inputProof: encrypted.inputProof,
          signature,
        };
        claimLinks.push({ address: row.address, amountDisplay: row.amountDisplay, url: buildClaimUrl(payload) });
      }

      onSuccess({ txHash: hash, airdropAddress: airdrop, claimLinks });
    } catch (err) {
      toast({
        kind: "error",
        title: "Airdrop launch failed",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsLaunching(false);
      setProgress(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink-900">Review & launch</h2>
        <p className="mt-1 text-sm text-ink-500">
          Recipients claim on their own schedule — you&apos;ll get a shareable link for each one.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-xl bg-paper-100 p-4 sm:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-500">Recipients</p>
          <p className="font-display text-lg font-semibold text-ink-900">{recipients.length}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-500">Total</p>
          <p className="font-mono text-lg font-semibold text-ink-900">{formatAmount(totalRaw)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-500">Token</p>
          <p className="font-display text-lg font-semibold text-ink-900">{tokenSymbol}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-500">Mode</p>
          <p className="font-display text-lg font-semibold text-ink-900">Airdrop</p>
        </div>
      </div>

      <div className="rounded-xl border border-ink-900/10 px-4">
        <ChecklistRow
          ok={!!isApproved}
          pending={isCheckingApproval || setOperator.isPending}
          label="Airdrop factory approved to fund the pool"
          action={
            !isApproved && (
              <Button
                size="sm"
                variant="secondary"
                isLoading={setOperator.isPending}
                onClick={() =>
                  factoryAddress &&
                  setOperator.mutate(
                    { operator: factoryAddress, until: Math.floor(Date.now() / 1000) + 3600 },
                    {
                      onError: (err) => toast({ kind: "error", title: "Approval failed", description: err.message }),
                    },
                  )
                }
              >
                Approve
              </Button>
            )
          }
        />
      </div>

      <BalanceCheck
        tokenAddress={tokenAddress}
        tokenSymbol={tokenSymbol}
        requiredRaw={totalRaw}
        onResolved={setBalanceSufficient}
      />

      {progress && (
        <div className="flex flex-col gap-2 rounded-lg border border-accent-600/25 bg-accent-100/40 px-4 py-3">
          <p className="text-sm font-medium text-ink-900">
            Encrypting allocation {progress.current} of {progress.total}
          </p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-900/10">
            <div
              className="h-full rounded-full bg-accent-600 transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      <Button size="lg" disabled={!readyToLaunch} isLoading={isLaunching} onClick={handleLaunch}>
        {isLaunching
          ? progress
            ? `Encrypting ${progress.current}/${progress.total}…`
            : "Deploying airdrop…"
          : `Launch airdrop for ${recipients.length} recipients`}
      </Button>
    </div>
  );
}
