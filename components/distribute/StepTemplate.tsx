"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { TEMPLATES, type DistributionMode } from "@/lib/templates";

export function StepTemplate({
  selectedId,
  mode,
  onSelect,
  onModeChange,
}: {
  selectedId: string;
  mode: DistributionMode;
  onSelect: (templateId: string) => void;
  onModeChange: (mode: DistributionMode) => void;
}) {
  const template = TEMPLATES.find((t) => t.id === selectedId);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900">What are you distributing?</h2>
        <p className="mt-1 text-sm text-ink-500">
          Pick the closest fit. You can fine-tune everything after.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {TEMPLATES.map((t) => {
          const selected = t.id === selectedId;
          return (
            <button
              key={t.id}
              onClick={() => {
                onSelect(t.id);
                onModeChange(t.defaultMode);
              }}
              className={cn(
                "relative flex flex-col gap-2 rounded-xl border p-4 text-left transition-all",
                selected
                  ? "border-accent-600 bg-accent-100/30 ring-1 ring-accent-600"
                  : "border-ink-900/[0.07] hover:border-ink-900/[0.12]",
              )}
            >
              {selected && (
                <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-accent-600 text-paper-50">
                  <Check className="size-3" />
                </span>
              )}
              <div className="flex size-9 items-center justify-center rounded-lg bg-ink-900/5 text-ink-700">
                <t.icon className="size-4" />
              </div>
              <h3 className="font-display text-base font-semibold text-ink-900">{t.name}</h3>
              <p className="text-xs text-ink-500">{t.description}</p>
            </button>
          );
        })}
      </div>

      {template && (
        <div className="rounded-lg border border-ink-900/[0.07] bg-paper-50">
          <button
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-ink-700 hover:bg-paper-100 hover:rounded-t-lg transition-colors"
          >
            Advanced: distribution mechanism
            <ChevronDown
              className={cn("size-4 transition-transform duration-200", advancedOpen && "rotate-180")}
            />
          </button>
          {advancedOpen && (
            <div className="border-t border-ink-900/[0.05] px-4 py-3 flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  checked={mode === "disperse"}
                  onChange={() => onModeChange("disperse")}
                  className="size-4 accent-accent-600 cursor-pointer"
                />
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium text-ink-900">Disperse</span>
                  <span className="text-xs text-ink-500">Pushed directly to each wallet, one transaction.</span>
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  checked={mode === "airdrop"}
                  onChange={() => onModeChange("airdrop")}
                  className="size-4 accent-accent-600 cursor-pointer"
                />
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium text-ink-900">Airdrop</span>
                  <span className="text-xs text-ink-500">Recipients claim on their own schedule via a link.</span>
                </span>
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
