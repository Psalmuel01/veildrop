"use client";

import Link from "next/link";
import { useFaucetMetadata } from "@tokenops/sdk/testnet-faucet/react";
import { Coins, ArrowUpRight } from "lucide-react";
import { Input, Label } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
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
}: {
  mode: DistributionMode;
  config: DistributionConfig;
  onChange: (config: DistributionConfig) => void;
}) {
  const { data: meta, isLoading } = useFaucetMetadata();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900">Configure the distribution</h2>
        <p className="mt-1 text-sm text-ink-500">Name it, and confirm the token you&apos;re sending.</p>
      </div>

      <div>
        <Label>Token</Label>
        {isLoading || !meta ? (
          <Skeleton className="mt-2 h-14 w-full" />
        ) : (
          <div className="mt-2 flex items-center justify-between rounded-lg border border-ink-900/[0.06] bg-paper-100 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-accent-100 text-accent-700">
                <Coins className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink-900">{meta.confidential.symbol}</p>
                <p className="font-mono text-xs text-ink-500">{meta.confidential.address}</p>
              </div>
            </div>
            <Link
              href="/faucet"
              className="flex items-center gap-1 text-xs font-medium text-accent-600 hover:text-accent-700"
            >
              Mint more
              <ArrowUpRight className="size-3" />
            </Link>
          </div>
        )}
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
          placeholder="Internal note — recipients never see this."
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
