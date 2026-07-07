"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { useZamaSDK } from "@zama-fhe/react-sdk";
import {
  useIsRegistered,
  useRegister,
  useApproveTokenOnWallets,
  usePreflightDisperse,
  useDisperse,
} from "@tokenops/sdk/fhe-disperse/react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import type { Address } from "viem";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { BalanceCheck } from "@/components/distribute/BalanceCheck";
import { formatAmount } from "@/lib/amount";
import { toTokenOpsEncryptor } from "@/lib/encryptor-adapter";
import type { RecipientRow } from "@/lib/recipients";
import type { DisperseResult } from "@tokenops/sdk/fhe-disperse";

function ChecklistItem({ ok, pending, label, action }: { ok: boolean; pending?: boolean; label: string; action?: React.ReactNode }) {
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

export function StepReviewDisperse({
  recipients,
  tokenAddress,
  tokenSymbol,
  onSuccess,
}: {
  recipients: RecipientRow[];
  tokenAddress: Address;
  tokenSymbol: string;
  onSuccess: (result: DisperseResult) => void;
}) {
  const queryClient = useQueryClient();
  const { push: toast } = useToast();
  const { address: user } = useAccount();
  const zamaSDK = useZamaSDK();
  const [balanceSufficient, setBalanceSufficient] = useState<boolean | null>(null);

  const addresses = useMemo(() => recipients.map((r) => r.address as Address), [recipients]);
  const amounts = useMemo(() => recipients.map((r) => r.amountRaw), [recipients]);
  const totalRaw = useMemo(() => amounts.reduce((a, b) => a + b, 0n), [amounts]);

  const { data: isRegistered, isLoading: isCheckingRegistration } = useIsRegistered({ user });
  const register = useRegister();
  const approve = useApproveTokenOnWallets();

  const { data: preflight, isLoading: isPreflighting } = usePreflightDisperse({
    user,
    token: tokenAddress,
    recipients: addresses,
    amounts,
    mode: "wallet",
  });

  const disperse = useDisperse({ encryptor: () => toTokenOpsEncryptor(zamaSDK.relayer) });

  function invalidateDisperse() {
    queryClient.invalidateQueries({ queryKey: ["tokenops-sdk", "fhe-disperse"] });
  }

  const readyToExecute = !!preflight?.ready && balanceSufficient === true;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink-900">Review & execute</h2>
        <p className="mt-1 text-sm text-ink-500">Tokens are pushed directly — no claim step for recipients.</p>
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
          <p className="font-display text-lg font-semibold text-ink-900">Disperse</p>
        </div>
      </div>

      <div className="rounded-xl border border-ink-900/10 px-4">
        <ChecklistItem
          ok={!!isRegistered}
          pending={isCheckingRegistration || register.isPending}
          label={isRegistered ? "Registered for disperse" : "Register for disperse (one-time)"}
          action={
            !isRegistered && (
              <Button
                size="sm"
                variant="secondary"
                isLoading={register.isPending}
                onClick={() =>
                  register.mutate(
                    { token: tokenAddress },
                    {
                      onSuccess: invalidateDisperse,
                      onError: (err) => toast({ kind: "error", title: "Registration failed", description: err.message }),
                    },
                  )
                }
              >
                Register
              </Button>
            )
          }
        />
        <ChecklistItem
          ok={!!preflight?.hasApprovedSubwallets.both}
          pending={isPreflighting || approve.isPending}
          label="Subwallets approved for this token"
          action={
            !!isRegistered &&
            !preflight?.hasApprovedSubwallets.both && (
              <Button
                size="sm"
                variant="secondary"
                isLoading={approve.isPending}
                onClick={() =>
                  approve.mutate(
                    { token: tokenAddress },
                    {
                      onSuccess: invalidateDisperse,
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
        <ChecklistItem ok={!!preflight?.batchOk} pending={isPreflighting} label="Within batch size limit" />
        <ChecklistItem ok={!!preflight?.amountsOk} pending={isPreflighting} label="All recipients valid" />
      </div>

      <BalanceCheck
        tokenAddress={tokenAddress}
        tokenSymbol={tokenSymbol}
        requiredRaw={totalRaw}
        onResolved={setBalanceSufficient}
      />

      <Button
        size="lg"
        disabled={!readyToExecute}
        isLoading={disperse.isPending}
        onClick={() =>
          disperse.mutate(
            { token: tokenAddress, mode: "wallet", recipients: addresses, amounts },
            {
              onSuccess: (result) => {
                invalidateDisperse();
                onSuccess(result);
              },
              onError: (err) => toast({ kind: "error", title: "Disperse failed", description: err.message }),
            },
          )
        }
      >
        {disperse.isPending ? "Dispersing…" : `Disperse to ${recipients.length} recipients`}
      </Button>
    </div>
  );
}
