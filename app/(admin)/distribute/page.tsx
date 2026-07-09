"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { sepolia } from "wagmi/chains";
import { AlertTriangle, Check, Clock3, Trash2, Wallet } from "lucide-react";
import { useFaucetMetadata } from "@tokenops/sdk/testnet-faucet/react";
import { WalletButton } from "@/components/WalletButton";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { StepTemplate } from "@/components/distribute/StepTemplate";
import { StepConfigure, type DistributionConfig } from "@/components/distribute/StepConfigure";
import { StepRecipients } from "@/components/distribute/StepRecipients";
import { StepReviewDisperse } from "@/components/distribute/StepReviewDisperse";
import { StepReviewAirdrop, type AirdropSuccessResult } from "@/components/distribute/StepReviewAirdrop";
import { StepSuccess } from "@/components/distribute/StepSuccess";
import { TEMPLATES, type DistributionMode } from "@/lib/templates";
import { summarizeRecipients, type RecipientRow } from "@/lib/recipients";
import { createDistribution, upsertAddressBookEntry } from "@/lib/api";
import { clearDistributionDraft, loadDistributionDraft, saveDistributionDraft } from "@/lib/distribution-drafts";
import { getTokenConfig } from "@/lib/tokens";
import { cn } from "@/lib/cn";
import { useIsZamaReady } from "@/app/providers";
import { useToast } from "@/components/ui/Toast";
import type { DisperseResult } from "@tokenops/sdk/fhe-disperse";

interface WizardResult {
  mode: DistributionMode;
  txHash: string;
  recipientCount: number;
  claimLinks?: AirdropSuccessResult["claimLinks"];
}

const STEPS = ["Use case", "Configure", "Recipients", "Review", "Done"] as const;

function Stepper({ step }: { step: number }) {
  return (
    <div className="mb-10 flex items-center justify-center gap-2">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className={cn(
              "flex size-7 items-center justify-center rounded-full text-xs font-medium transition-colors",
              i < step
                ? "bg-accent-600 text-paper-50"
                : i === step
                  ? "bg-ink-900 text-paper-50"
                  : "bg-ink-900/10 text-ink-500",
            )}
          >
            {i < step ? <Check className="size-3.5" /> : i + 1}
          </div>
          {i < STEPS.length - 1 && <div className="h-px w-8 bg-ink-900/15 sm:w-14" />}
        </div>
      ))}
    </div>
  );
}

function DistributeWizard() {
  const searchParams = useSearchParams();
  const { address, isConnected, chainId } = useAccount();
  const isSepolia = chainId === sepolia.id;
  const isZamaReady = useIsZamaReady();
  const { push: toast } = useToast();
  const { isLoading: isLoadingMeta } = useFaucetMetadata();

  const initialTemplate = TEMPLATES.find((t) => t.id === searchParams.get("template")) ?? TEMPLATES[0]!;

  const [step, setStep] = useState(0);
  const [templateId, setTemplateId] = useState(initialTemplate.id);
  const [mode, setMode] = useState<DistributionMode>(initialTemplate.defaultMode);
  const [selectedTokenId, setSelectedTokenId] = useState<string>("veil");
  const [config, setConfig] = useState<DistributionConfig>({
    title: initialTemplate.copy.title,
    description: "",
    claimStart: "",
    claimEnd: "",
  });
  // Tracks the last title a template auto-filled, so switching templates
  // keeps updating the title right up until the user types their own,
  // instead of only ever applying on the very first pick.
  const [autoTitle, setAutoTitle] = useState(initialTemplate.copy.title);
  const [recipients, setRecipients] = useState<RecipientRow[]>([]);
  const [result, setResult] = useState<WizardResult | null>(null);
  const [draftLoadedAt, setDraftLoadedAt] = useState<number | null>(null);
  const [draftStatus, setDraftStatus] = useState<"idle" | "saved">("idle");

  const template = TEMPLATES.find((t) => t.id === templateId)!;
  const selectedToken = getTokenConfig(selectedTokenId);
  const summary = summarizeRecipients(recipients);
  const validRecipients = recipients.filter((r) => r.isValidAddress && r.isValidAmount && !r.isDuplicate);

  useEffect(() => {
    if (!address) return;
    const draft = loadDistributionDraft(address);
    if (!draft) return;
    setStep(Math.min(draft.step, 3));
    setTemplateId(TEMPLATES.some((t) => t.id === draft.templateId) ? draft.templateId : TEMPLATES[0]!.id);
    setMode(draft.mode);
    setSelectedTokenId(draft.selectedTokenId || "veil");
    setConfig(draft.config);
    const restoredTemplate = TEMPLATES.find((t) => t.id === draft.templateId) ?? TEMPLATES[0]!;
    setAutoTitle(restoredTemplate.copy.title);
    setRecipients(draft.recipients);
    setDraftLoadedAt(draft.updatedAt);
  }, [address]);

  useEffect(() => {
    if (!address || result || step >= 4) return;
    saveDistributionDraft(address, {
      step,
      templateId,
      mode,
      selectedTokenId,
      config,
      recipients,
      updatedAt: Date.now(),
    });
    setDraftStatus("saved");
    const timeout = window.setTimeout(() => setDraftStatus("idle"), 1800);
    return () => window.clearTimeout(timeout);
  }, [address, step, templateId, mode, selectedTokenId, config, recipients, result]);

  function discardDraft() {
    if (address) clearDistributionDraft(address);
    const initial = TEMPLATES.find((t) => t.id === searchParams.get("template")) ?? TEMPLATES[0]!;
    setStep(0);
    setTemplateId(initial.id);
    setMode(initial.defaultMode);
    setSelectedTokenId("veil");
    setConfig({ title: initial.copy.title, description: "", claimStart: "", claimEnd: "" });
    setAutoTitle(initial.copy.title);
    setRecipients([]);
    setResult(null);
    setDraftLoadedAt(null);
  }

  // Best effort: every recipient gets remembered for the address book,
  // regardless of distribution mode. A failure here should never block the
  // success screen, the on-chain action already happened.
  function rememberRecipients() {
    if (!address) return;
    for (const r of validRecipients) {
      upsertAddressBookEntry({
        ownerAddress: address,
        address: r.address,
        lastAmount: r.amountDisplay,
        incrementUse: true,
      }).catch(() => null);
    }
  }

  async function handleDisperseSuccess(disperseResult: DisperseResult) {
    const txHash = disperseResult.hash;
    if (address) {
      try {
        await createDistribution({
          adminAddress: address,
          mode: "disperse",
          template: templateId,
          title: config.title || template.copy.title,
          description: config.description || undefined,
          token: selectedToken.address,
          tokenSymbol: selectedToken.symbol,
          txHash,
          recipients: validRecipients.map((r) => ({
            address: r.address,
            amountDisplay: r.amountDisplay,
            claimed: true,
          })),
        });
      } catch (err) {
        toast({
          kind: "error",
          title: "Saved on-chain, but history sync failed",
          description: err instanceof Error ? err.message : undefined,
        });
      }
      rememberRecipients();
      clearDistributionDraft(address);
    }
    setResult({ mode: "disperse", txHash, recipientCount: validRecipients.length });
    setStep(4);
  }

  async function handleAirdropSuccess(airdropResult: AirdropSuccessResult) {
    if (address) {
      try {
        await createDistribution({
          adminAddress: address,
          mode: "airdrop",
          template: templateId,
          title: config.title || template.copy.title,
          description: config.description || undefined,
          token: selectedToken.address,
          tokenSymbol: selectedToken.symbol,
          txHash: airdropResult.txHash,
          contractAddress: airdropResult.airdropAddress,
          claimWindowStart: config.claimStart ? new Date(config.claimStart).toISOString() : undefined,
          claimWindowEnd: config.claimEnd ? new Date(config.claimEnd).toISOString() : undefined,
          recipients: airdropResult.claimLinks.map((c) => ({
            address: c.address,
            amountDisplay: c.amountDisplay,
            claimUrl: c.url,
            claimed: false,
          })),
        });
      } catch (err) {
        toast({
          kind: "error",
          title: "Saved on-chain, but history sync failed",
          description: err instanceof Error ? err.message : undefined,
        });
      }
      rememberRecipients();
      clearDistributionDraft(address);
    }
    setResult({
      mode: "airdrop",
      txHash: airdropResult.txHash,
      recipientCount: validRecipients.length,
      claimLinks: airdropResult.claimLinks,
    });
    setStep(4);
  }

  const canAdvanceFromRecipients = validRecipients.length > 0 && summary.invalid === 0;

  if (!isConnected) {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <Wallet className="size-8 text-ink-500" />
          <p className="text-sm text-ink-700">Connect your wallet to create a distribution.</p>
          <WalletButton />
        </CardContent>
      </Card>
    );
  }

  if (!isSepolia) {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <AlertTriangle className="size-8 text-error-600" />
          <p className="text-sm text-ink-700">VeilDrop runs on Sepolia testnet.</p>
          <WalletButton />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-900/[0.07] bg-paper-50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-ink-500">
          <Clock3 className="size-4 text-accent-600" />
          {draftLoadedAt ? (
            <span>
              Draft restored from {new Date(draftLoadedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
            </span>
          ) : draftStatus === "saved" ? (
            <span>Draft saved</span>
          ) : (
            <span>Draft auto-saves on this wallet</span>
          )}
        </div>
        {(recipients.length > 0 || step > 0 || !!config.description) && (
          <Button size="sm" variant="ghost" onClick={discardDraft}>
            <Trash2 className="size-3.5" />
            Discard
          </Button>
        )}
      </div>
      <Stepper step={step} />
      <Card>
        <CardContent className="py-8">
          {step === 0 && (
            <StepTemplate
              selectedId={templateId}
              mode={mode}
              onSelect={(id) => {
                setTemplateId(id);
                const t = TEMPLATES.find((tt) => tt.id === id)!;
                setConfig((c) => {
                  // Keep auto-filling the title as the user browses templates,
                  // but stop the moment they've typed something of their own.
                  if (c.title !== "" && c.title !== autoTitle) return c;
                  return { ...c, title: t.copy.title };
                });
                setAutoTitle(t.copy.title);
              }}
              onModeChange={setMode}
            />
          )}
          {step === 1 && (
            <StepConfigure
              mode={mode}
              config={config}
              onChange={setConfig}
              selectedTokenId={selectedTokenId}
              onTokenChange={setSelectedTokenId}
            />
          )}
          {step === 2 && (
            <StepRecipients
              rows={recipients}
              onChange={setRecipients}
              tokenSymbol={selectedToken.symbol}
              recipientLabel={template.copy.recipientLabel}
            />
          )}
          {step === 3 &&
            (isLoadingMeta || !isZamaReady ? (
              <Skeleton className="h-64 w-full" />
            ) : mode === "disperse" ? (
              <StepReviewDisperse
                recipients={validRecipients}
                tokenAddress={selectedToken.address}
                tokenSymbol={selectedToken.symbol}
                onSuccess={handleDisperseSuccess}
              />
            ) : (
              <StepReviewAirdrop
                recipients={validRecipients}
                tokenAddress={selectedToken.address}
                tokenSymbol={selectedToken.symbol}
                config={config}
                onSuccess={handleAirdropSuccess}
              />
            ))}
          {step === 4 && result && (
            <StepSuccess
              mode={result.mode}
              txHash={result.txHash}
              recipientCount={result.recipientCount}
              claimLinks={result.claimLinks}
            />
          )}

          {step < 4 && (
            <div className="mt-8 flex items-center justify-between border-t border-ink-900/[0.05] pt-6">
              <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
                Back
              </Button>
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={
                  (step === 1 && !config.title.trim()) || (step === 2 && !canAdvanceFromRecipients) || step === 3
                }
              >
                {step === 2 ? `Continue with ${validRecipients.length} recipients` : "Continue"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function DistributePage() {
  return (
    <main className="px-5 py-16 sm:px-8">
      <Suspense
        fallback={
          <div className="mx-auto max-w-3xl">
            <Skeleton className="h-96 w-full" />
          </div>
        }
      >
        <DistributeWizard />
      </Suspense>
    </main>
  );
}
