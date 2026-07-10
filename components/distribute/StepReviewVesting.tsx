"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { useZamaSDK, useConfidentialSetOperator } from "@zama-fhe/react-sdk";
import { useCreateManagerAndGetAddress } from "@tokenops/sdk/fhe-vesting/react";
import { confidentialVestingManagerAbi, createConfidentialVestingManagerClient, type VestingParams } from "@tokenops/sdk/fhe-vesting";
import { getFheVestingFactoryAddress } from "@tokenops/sdk";
import type { Address } from "viem";
import { parseEventLogs } from "viem";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { BalanceCheck } from "@/components/distribute/BalanceCheck";
import { LaunchErrorPanel, LaunchTimeline, type LaunchStep } from "@/components/distribute/LaunchTimeline";
import { VestingScheduleTimeline } from "@/components/distribute/VestingScheduleTimeline";
import { formatAmount } from "@/lib/amount";
import { toTokenOpsEncryptor } from "@/lib/encryptor-adapter";
import type { RecipientRow } from "@/lib/recipients";
import { toSeconds, type DistributionConfig } from "@/components/distribute/StepConfigure";

export interface VestingScheduleResult {
  address: string;
  amountDisplay: string;
  vestingId: `0x${string}` | undefined;
}

export interface VestingSuccessResult {
  txHash: string;
  batchTxHash: string;
  managerAddress: Address;
  schedules: VestingScheduleResult[];
}

function randomSalt(): `0x${string}` {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return `0x${Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;
}

export function StepReviewVesting({
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
  onSuccess: (result: VestingSuccessResult) => void;
}) {
  const queryClient = useQueryClient();
  const { push: toast } = useToast();
  const { address: admin, chainId } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const zamaSDK = useZamaSDK();
  const [balanceSufficient, setBalanceSufficient] = useState<boolean | null>(null);
  const [managerAddress, setManagerAddress] = useState<Address | undefined>(undefined);
  const [operatorApproved, setOperatorApproved] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchPhase, setLaunchPhase] = useState<"idle" | "deploying" | "approving" | "registering">("idle");
  const [launchError, setLaunchError] = useState<string | null>(null);

  const totalRaw = recipients.reduce((sum, r) => sum + r.amountRaw, 0n);
  const factoryAddress = chainId ? getFheVestingFactoryAddress(chainId) : undefined;
  const cliffSeconds = toSeconds(config.cliffValue ?? 0, config.cliffUnit ?? "days");
  const vestingSeconds = toSeconds(config.vestingValue ?? 0, config.vestingUnit ?? "days");

  const setOperator = useConfidentialSetOperator(tokenAddress);
  const create = useCreateManagerAndGetAddress();

  const readyToLaunch = balanceSufficient === true && !!admin && !!factoryAddress && !!publicClient && !!walletClient;

  const launchSteps: LaunchStep[] = [
    {
      id: "balance",
      label: "Check encrypted token balance",
      detail: `${formatAmount(totalRaw)} ${tokenSymbol} required`,
      status: balanceSufficient === null ? "pending" : balanceSufficient ? "complete" : "failed",
    },
    {
      id: "deploy",
      label: "Create vesting manager",
      detail: "Wallet confirmation and chain confirmation happen here",
      status: launchPhase === "deploying" ? "pending" : managerAddress ? "complete" : launchError ? "failed" : "idle",
    },
    {
      id: "operator",
      label: "Approve vesting manager to fund schedules",
      status: launchPhase === "approving" ? "pending" : operatorApproved ? "complete" : launchError ? "failed" : "idle",
    },
    {
      id: "register",
      label: `Register ${recipients.length} vesting schedule${recipients.length !== 1 ? "s" : ""}`,
      detail: "One encrypted batch transaction covers every recipient",
      status: launchPhase === "registering" ? "pending" : launchError ? "failed" : "idle",
    },
  ];

  async function handleLaunch() {
    if (!admin || !publicClient || !walletClient) return;
    setIsLaunching(true);
    setLaunchError(null);
    setLaunchPhase("deploying");
    try {
      const { hash, manager } = await create.mutateAsync({ token: tokenAddress, userSalt: randomSalt() });
      setManagerAddress(manager);
      queryClient.invalidateQueries({ queryKey: ["tokenops-sdk", "fhe-vesting"] });

      setLaunchPhase("approving");
      await setOperator.mutateAsync({ operator: manager, until: Math.floor(Date.now() / 1000) + 3600 });
      setOperatorApproved(true);

      setLaunchPhase("registering");
      const managerClient = createConfidentialVestingManagerClient({
        publicClient,
        walletClient,
        address: manager,
        encryptor: toTokenOpsEncryptor(zamaSDK.relayer),
      });

      const now = Math.floor(Date.now() / 1000);
      const items = recipients.map((row) => ({
        params: {
          recipient: row.address as Address,
          startTimestamp: now,
          endTimestamp: now + cliffSeconds + vestingSeconds,
          cliffSeconds,
          releaseIntervalSecs: 60,
          timelockSeconds: 0,
          initialUnlockBps: 0,
          cliffAmountBps: 0,
          isRevocable: false,
        } satisfies VestingParams,
        amount: row.amountRaw,
      }));

      const batchTxHash = await managerClient.batchCreateVesting({ items });
      const receipt = await publicClient.waitForTransactionReceipt({ hash: batchTxHash });
      const events = parseEventLogs({ abi: confidentialVestingManagerAbi, logs: receipt.logs, eventName: "VestingCreated" });

      const schedules: VestingScheduleResult[] = recipients.map((row) => {
        const match = events.find(
          (e) => (e.args as { recipient?: Address }).recipient?.toLowerCase() === row.address.toLowerCase(),
        );
        return {
          address: row.address,
          amountDisplay: row.amountDisplay,
          vestingId: (match?.args as { vestingId?: `0x${string}` } | undefined)?.vestingId,
        };
      });

      onSuccess({ txHash: hash, batchTxHash, managerAddress: manager, schedules });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setLaunchError(message);
      toast({ kind: "error", title: "Vesting launch failed", description: message });
    } finally {
      setIsLaunching(false);
      setLaunchPhase("idle");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900">Review &amp; launch</h2>
        <p className="mt-1 text-sm text-ink-500">
          Recipients unlock gradually after a cliff, and can claim their available amount at any time.
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
          <p className="font-display text-lg font-semibold text-ink-900">Vesting</p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-ink-900">Schedule preview</p>
        <VestingScheduleTimeline cliffSeconds={cliffSeconds} vestingSeconds={vestingSeconds} />
      </div>

      <BalanceCheck tokenAddress={tokenAddress} tokenSymbol={tokenSymbol} requiredRaw={totalRaw} onResolved={setBalanceSufficient} />

      <LaunchTimeline steps={launchSteps} />

      {launchError && (
        <LaunchErrorPanel title="Vesting launch failed" message={launchError} onRetry={readyToLaunch ? handleLaunch : undefined} />
      )}

      <Button size="lg" disabled={!readyToLaunch} isLoading={isLaunching} onClick={handleLaunch}>
        {isLaunching
          ? launchPhase === "deploying"
            ? "Deploying manager…"
            : launchPhase === "approving"
              ? "Approving…"
              : "Registering schedules…"
          : `Launch vesting for ${recipients.length} recipients`}
      </Button>
    </div>
  );
}
