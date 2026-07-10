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
  vestingId: string | null;
  totalClaimedAmount: string | null;
  createdAt: string;
}

export interface ApiDistribution {
  id: string;
  adminAddress: string;
  mode: "disperse" | "airdrop" | "vesting";
  template: string;
  title: string;
  description: string | null;
  token: string;
  tokenSymbol: string;
  txHash: string | null;
  contractAddress: string | null;
  claimWindowStart: string | null;
  claimWindowEnd: string | null;
  cliffSeconds: number | null;
  vestingSeconds: number | null;
  status: string;
  createdAt: string;
  recipients: ApiRecipient[];
}

export interface PendingRecipient {
  id: string;
  distributionId: string;
  title: string;
  mode: "disperse" | "airdrop" | "vesting";
  adminAddress: string;
  amountDisplay: string;
  tokenSymbol: string;
  claimUrl: string | null;
  claimWindowEnd: string | null;
  totalClaimedAmount: string | null;
  createdAt: string;
}

export interface HistoryRecipient extends PendingRecipient {
  claimed: boolean;
  claimedAt: string | null;
  revealed: boolean;
  revealedAt: string | null;
  distributionTxHash: string | null;
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
  mode: "disperse" | "airdrop" | "vesting";
  template: string;
  title: string;
  description?: string;
  token: string;
  tokenSymbol: string;
  txHash?: string;
  contractAddress?: string;
  claimWindowStart?: string;
  claimWindowEnd?: string;
  cliffSeconds?: number;
  vestingSeconds?: number;
  recipients: { address: string; amountDisplay: string; claimUrl?: string; vestingId?: string; claimed: boolean }[];
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

export interface VestingClaimDto {
  id: string;
  recipientId: string;
  amountDisplay: string;
  txHash: string;
  claimedAt: string;
}

export interface VestingScheduleDto extends ApiRecipient {
  distribution: ApiDistribution;
  vestingClaims: VestingClaimDto[];
}

export async function getVestingSchedule(recipientId: string): Promise<VestingScheduleDto | null> {
  const res = await fetch(`/api/vesting/${recipientId}/schedule`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load vesting schedule ${recipientId}`);
  return res.json();
}

export function recordVestingClaim(input: { recipientId: string; amountDisplay: string; txHash: string }) {
  return api<VestingScheduleDto>("/api/vesting/claims", { method: "POST", body: JSON.stringify(input) });
}
