"use client";

import type { DistributionConfig } from "@/components/distribute/StepConfigure";
import type { RecipientRow } from "@/lib/recipients";
import type { DistributionMode } from "@/lib/templates";

export interface DistributionDraft {
  step: number;
  templateId: string;
  mode: DistributionMode;
  config: DistributionConfig;
  recipients: RecipientRow[];
  updatedAt: number;
}

interface StoredRecipientRow extends Omit<RecipientRow, "amountRaw"> {
  amountRaw: string;
}

interface StoredDistributionDraft extends Omit<DistributionDraft, "recipients"> {
  recipients: StoredRecipientRow[];
}

function storageKey(owner: string) {
  return `veildrop:draft:${owner.toLowerCase()}`;
}

function serializeDraft(draft: DistributionDraft): StoredDistributionDraft {
  return {
    ...draft,
    recipients: draft.recipients.map((row) => ({ ...row, amountRaw: row.amountRaw.toString() })),
  };
}

function hydrateDraft(stored: StoredDistributionDraft): DistributionDraft {
  return {
    ...stored,
    recipients: stored.recipients.map((row) => ({ ...row, amountRaw: BigInt(row.amountRaw) })),
  };
}

export function loadDistributionDraft(owner: string): DistributionDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(owner));
    return raw ? hydrateDraft(JSON.parse(raw) as StoredDistributionDraft) : null;
  } catch {
    return null;
  }
}

export function saveDistributionDraft(owner: string, draft: DistributionDraft): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(owner), JSON.stringify(serializeDraft(draft)));
}

export function clearDistributionDraft(owner: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(storageKey(owner));
}
