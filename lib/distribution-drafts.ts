"use client";

import type { DistributionConfig } from "@/components/distribute/StepConfigure";
import type { RecipientRow } from "@/lib/recipients";
import type { DistributionMode } from "@/lib/templates";
import { deleteDraft, listDrafts, saveDraft, type DraftDto } from "@/lib/api";

export interface DistributionDraft {
  id: string;
  step: number;
  templateId: string;
  mode: DistributionMode;
  selectedTokenId: string;
  config: DistributionConfig;
  recipients: RecipientRow[];
  updatedAt: string;
}

interface StoredRecipientRow extends Omit<RecipientRow, "amountRaw"> {
  amountRaw: string;
}

interface StoredFormState {
  step: number;
  selectedTokenId: string;
  config: DistributionConfig;
  recipients: StoredRecipientRow[];
}

interface DraftFields {
  templateId: string;
  mode: DistributionMode;
  step: number;
  selectedTokenId: string;
  config: DistributionConfig;
  recipients: RecipientRow[];
}

function serializeFormState(draft: DraftFields): StoredFormState {
  return {
    step: draft.step,
    selectedTokenId: draft.selectedTokenId,
    config: draft.config,
    recipients: draft.recipients.map((row) => ({ ...row, amountRaw: row.amountRaw.toString() })),
  };
}

function hydrateDraft(dto: DraftDto): DistributionDraft {
  const formState = dto.formState as StoredFormState;
  return {
    id: dto.id,
    step: formState.step,
    templateId: dto.template,
    mode: dto.mode as DistributionMode,
    selectedTokenId: formState.selectedTokenId,
    config: formState.config,
    recipients: formState.recipients.map((row) => ({ ...row, amountRaw: BigInt(row.amountRaw) })),
    updatedAt: dto.updatedAt,
  };
}

export async function loadLatestDraft(owner: string): Promise<DistributionDraft | null> {
  const drafts = await listDrafts(owner);
  if (drafts.length === 0) return null;
  const latest = drafts.reduce((a, b) => (new Date(a.updatedAt) > new Date(b.updatedAt) ? a : b));
  return hydrateDraft(latest);
}

export async function persistDraft(
  owner: string,
  existingId: string | undefined,
  draft: DraftFields,
): Promise<DistributionDraft> {
  const dto = await saveDraft({
    id: existingId,
    ownerAddress: owner,
    mode: draft.mode,
    template: draft.templateId,
    formState: serializeFormState(draft),
  });
  return hydrateDraft(dto);
}

export async function removeDraft(id: string): Promise<void> {
  await deleteDraft(id).catch(() => null);
}
