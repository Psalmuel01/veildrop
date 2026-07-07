"use client";

export type DistributionMode = "disperse" | "airdrop";

export interface StoredRecipientClaim {
  address: string;
  claimed: boolean;
  claimUrl?: string;
}

export interface StoredDistribution {
  id: string;
  mode: DistributionMode;
  templateId: string;
  title: string;
  token: string;
  tokenSymbol: string;
  recipientCount: number;
  createdAt: number;
  txHash: string;
  airdropAddress?: string;
  recipients: StoredRecipientClaim[];
}

function storageKey(owner: string) {
  return `veildrop:distributions:${owner.toLowerCase()}`;
}

export function loadDistributions(owner: string): StoredDistribution[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(owner));
    return raw ? (JSON.parse(raw) as StoredDistribution[]) : [];
  } catch {
    return [];
  }
}

export function saveDistribution(owner: string, distribution: StoredDistribution): void {
  if (typeof window === "undefined") return;
  const existing = loadDistributions(owner);
  const next = [distribution, ...existing];
  window.localStorage.setItem(storageKey(owner), JSON.stringify(next));
}

export function updateDistribution(
  owner: string,
  id: string,
  patch: Partial<StoredDistribution>,
): void {
  if (typeof window === "undefined") return;
  const existing = loadDistributions(owner);
  const next = existing.map((d) => (d.id === id ? { ...d, ...patch } : d));
  window.localStorage.setItem(storageKey(owner), JSON.stringify(next));
}
