"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { sepolia } from "wagmi/chains";
import { Check, Wallet, AlertTriangle } from "lucide-react";
import { useFaucetMetadata } from "@tokenops/sdk/testnet-faucet/react";
import { Header } from "@/components/Header";
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
import { saveDistribution } from "@/lib/distributions";
import { cn } from "@/lib/cn";
import { useIsZamaReady } from "@/app/providers";
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
  const { data: meta, isLoading: isLoadingMeta } = useFaucetMetadata();

  const initialTemplate = TEMPLATES.find((t) => t.id === searchParams.get("template")) ?? TEMPLATES[0]!;

  const [step, setStep] = useState(0);
  const [templateId, setTemplateId] = useState(initialTemplate.id);
  const [mode, setMode] = useState<DistributionMode>(initialTemplate.defaultMode);
  const [config, setConfig] = useState<DistributionConfig>({
    title: initialTemplate.copy.title,
    description: "",
    claimStart: "",
    claimEnd: "",
  });
  const [recipients, setRecipients] = useState<RecipientRow[]>([]);
  const [result, setResult] = useState<WizardResult | null>(null);

  const template = TEMPLATES.find((t) => t.id === templateId)!;
  const summary = summarizeRecipients(recipients);
  const validRecipients = recipients.filter((r) => r.isValidAddress && r.isValidAmount && !r.isDuplicate);

  function handleDisperseSuccess(disperseResult: DisperseResult) {
    const txHash = disperseResult.hash;
    if (address) {
      saveDistribution(address, {
        id: crypto.randomUUID(),
        mode: "disperse",
        templateId,
        title: config.title || template.copy.title,
        token: meta?.confidential.address ?? "",
        tokenSymbol: meta?.confidential.symbol ?? "CTTT",
        recipientCount: validRecipients.length,
        createdAt: Date.now(),
        txHash,
        recipients: validRecipients.map((r) => ({ address: r.address, claimed: true })),
      });
    }
    setResult({ mode: "disperse", txHash, recipientCount: validRecipients.length });
    setStep(4);
  }

  function handleAirdropSuccess(airdropResult: AirdropSuccessResult) {
    if (address) {
      saveDistribution(address, {
        id: crypto.randomUUID(),
        mode: "airdrop",
        templateId,
        title: config.title || template.copy.title,
        token: meta?.confidential.address ?? "",
        tokenSymbol: meta?.confidential.symbol ?? "CTTT",
        recipientCount: validRecipients.length,
        createdAt: Date.now(),
        txHash: airdropResult.txHash,
        airdropAddress: airdropResult.airdropAddress,
        recipients: airdropResult.claimLinks.map((c) => ({ address: c.address, claimed: false, claimUrl: c.url })),
      });
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
                setConfig((c) => ({ ...c, title: c.title || t.copy.title }));
              }}
              onModeChange={setMode}
            />
          )}
          {step === 1 && <StepConfigure mode={mode} config={config} onChange={setConfig} />}
          {step === 2 && (
            <StepRecipients
              rows={recipients}
              onChange={setRecipients}
              tokenSymbol={meta?.confidential.symbol ?? "CTTT"}
              recipientLabel={template.copy.recipientLabel}
            />
          )}
          {step === 3 &&
            (isLoadingMeta || !meta || !isZamaReady ? (
              <Skeleton className="h-64 w-full" />
            ) : mode === "disperse" ? (
              <StepReviewDisperse
                recipients={validRecipients}
                tokenAddress={meta.confidential.address}
                tokenSymbol={meta.confidential.symbol}
                onSuccess={handleDisperseSuccess}
              />
            ) : (
              <StepReviewAirdrop
                recipients={validRecipients}
                tokenAddress={meta.confidential.address}
                tokenSymbol={meta.confidential.symbol}
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
            <div className="mt-8 flex items-center justify-between border-t border-ink-900/8 pt-6">
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
    <div className="min-h-screen bg-paper-100">
      <Header />
      <main className="px-5 py-16 sm:px-8">
        <Suspense fallback={<div className="mx-auto max-w-3xl"><Skeleton className="h-96 w-full" /></div>}>
          <DistributeWizard />
        </Suspense>
      </main>
    </div>
  );
}
