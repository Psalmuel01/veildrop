export interface ApiRecipient {
  id: string;
  distributionId: string;
  address: string;
  amountDisplay: string;
  claimUrl: string | null;
  claimed: boolean;
  claimedAt: string | null;
  revealed: boolean;
  revealedAt: string | null;
  notifiedAt: string | null;
  txHash: string | null;
  createdAt: string;
}

export interface ApiDistribution {
  id: string;
  adminAddress: string;
  mode: "disperse" | "airdrop";
  template: string;
  title: string;
  description: string | null;
  token: string;
  tokenSymbol: string;
  txHash: string | null;
  contractAddress: string | null;
  claimWindowStart: string | null;
  claimWindowEnd: string | null;
  status: string;
  createdAt: string;
  recipients: ApiRecipient[];
}

export interface PendingRecipient {
  id: string;
  distributionId: string;
  title: string;
  mode: "disperse" | "airdrop";
  adminAddress: string;
  amountDisplay: string;
  claimUrl: string | null;
  claimWindowEnd: string | null;
  createdAt: string;
}

export interface HistoryRecipient extends PendingRecipient {
  claimed: boolean;
  claimedAt: string | null;
  revealed: boolean;
  revealedAt: string | null;
}

export interface AddressBookEntryDto {
  id: string;
  ownerAddress: string;
  address: string;
  label: string | null;
  lastAmount: string | null;
  useCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DraftDto {
  id: string;
  ownerAddress: string;
  mode: string;
  template: string;
  formState: unknown;
  updatedAt: string;
  createdAt: string;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request to ${path} failed with ${res.status}`);
  }
  return res.json();
}

export interface CreateDistributionInput {
  adminAddress: string;
  mode: "disperse" | "airdrop";
  template: string;
  title: string;
  description?: string;
  token: string;
  tokenSymbol: string;
  txHash?: string;
  contractAddress?: string;
  claimWindowStart?: string;
  claimWindowEnd?: string;
  recipients: { address: string; amountDisplay: string; claimUrl?: string; claimed: boolean }[];
}

export function createDistribution(input: CreateDistributionInput) {
  return api<ApiDistribution>("/api/distributions", { method: "POST", body: JSON.stringify(input) });
}

export function listDistributions(admin: string) {
  return api<ApiDistribution[]>(`/api/distributions?admin=${encodeURIComponent(admin)}`);
}

export async function getDistribution(id: string): Promise<ApiDistribution | null> {
  const res = await fetch(`/api/distributions/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load distribution ${id}`);
  return res.json();
}

export function setDistributionStatus(id: string, status: string) {
  return api<ApiDistribution>(`/api/distributions/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function getPendingRecipients(address: string) {
  return api<PendingRecipient[]>(`/api/recipients/pending?address=${encodeURIComponent(address)}`);
}

export function getRecipientHistory(address: string) {
  return api<HistoryRecipient[]>(`/api/recipients/history?address=${encodeURIComponent(address)}`);
}

export function patchRecipient(
  id: string,
  patch: { claimed?: boolean; revealed?: boolean; notifiedAt?: boolean; txHash?: string },
) {
  return api<ApiRecipient>(`/api/recipients/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}

export function getRecipient(id: string) {
  return api<ApiRecipient & { distribution: ApiDistribution }>(`/api/recipients/${id}`);
}

export function listAddressBook(owner: string) {
  return api<AddressBookEntryDto[]>(`/api/address-book?owner=${encodeURIComponent(owner)}`);
}

export function upsertAddressBookEntry(input: {
  ownerAddress: string;
  address: string;
  label?: string;
  lastAmount?: string;
  incrementUse?: boolean;
}) {
  return api<AddressBookEntryDto>("/api/address-book", { method: "POST", body: JSON.stringify(input) });
}

export function deleteAddressBookEntry(id: string) {
  return api<{ ok: true }>(`/api/address-book/${id}`, { method: "DELETE" });
}

export function renameAddressBookEntry(id: string, label: string) {
  return api<AddressBookEntryDto>(`/api/address-book/${id}`, { method: "PATCH", body: JSON.stringify({ label }) });
}

export function listDrafts(owner: string) {
  return api<DraftDto[]>(`/api/drafts?owner=${encodeURIComponent(owner)}`);
}

export function saveDraft(input: { id?: string; ownerAddress: string; mode: string; template: string; formState: unknown }) {
  return api<DraftDto>("/api/drafts", { method: "POST", body: JSON.stringify(input) });
}

export function deleteDraft(id: string) {
  return api<{ ok: true }>(`/api/drafts/${id}`, { method: "DELETE" });
}
