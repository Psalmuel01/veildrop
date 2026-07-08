"use client";

import Link from "next/link";
import { useFaucetMetadata } from "@tokenops/sdk/testnet-faucet/react";
import { Coins, ArrowUpRight, Check } from "lucide-react";
import { Input, Label } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { SUPPORTED_TOKENS } from "@/lib/tokens";
import type { DistributionMode } from "@/lib/templates";

export interface DistributionConfig {
  title: string;
  description: string;
  claimStart: string;
  claimEnd: string;
}

function defaultDateTimeLocal(offsetMinutes: number): string {
  const d = new Date(Date.now() + offsetMinutes * 60_000);
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
}

export function StepConfigure({
  mode,
  config,
  onChange,
  selectedTokenId,
  onTokenChange,
}: {
  mode: DistributionMode;
  config: DistributionConfig;
  onChange: (config: DistributionConfig) => void;
  selectedTokenId: string;
  onTokenChange: (tokenId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900">Configure the distribution</h2>
        <p className="mt-1 text-sm text-ink-500">Select your token, name the distribution, and set details.</p>
      </div>

      <div>
        <Label>Token</Label>
        <div className="mt-2 flex flex-col gap-2">
          {SUPPORTED_TOKENS.map((token) => (
            <button
              key={token.id}
              onClick={() => onTokenChange(token.id)}
              className={`rounded-lg border-2 px-4 py-3 text-left transition-colors ${selectedTokenId === token.id
                  ? "border-accent-600 bg-accent-50"
                  : "border-ink-900/[0.06] bg-paper-100 hover:border-accent-600/40"
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-accent-100 text-accent-700">
                    <Coins className="size-4" />
                  </div>
                  <div>
                    <p className="font-medium text-ink-900">{token.symbol}</p>
                    <p className="text-xs text-ink-500">{token.name}</p>
                  </div>
                </div>
                {selectedTokenId === token.id && <Check className="size-5 text-accent-600" />}
              </div>
              <p className="mt-2 text-xs text-ink-500">{token.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          className="mt-2"
          value={config.title}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          placeholder="e.g. Q3 investor distribution"
        />
      </div>

      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <textarea
          id="description"
          value={config.description}
          onChange={(e) => onChange({ ...config, description: e.target.value })}
          rows={3}
          className="mt-2 w-full rounded-lg border border-ink-900/[0.08] bg-paper-50 px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-500/70 focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/40"
          placeholder="Internal note. Recipients never see this."
        />
      </div>

      {mode === "airdrop" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="claimStart">Claim window opens</Label>
            <Input
              id="claimStart"
              type="datetime-local"
              className="mt-2"
              value={config.claimStart || defaultDateTimeLocal(5)}
              onChange={(e) => onChange({ ...config, claimStart: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="claimEnd">Claim window closes</Label>
            <Input
              id="claimEnd"
              type="datetime-local"
              className="mt-2"
              value={config.claimEnd || defaultDateTimeLocal(60 * 24 * 30)}
              onChange={(e) => onChange({ ...config, claimEnd: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
