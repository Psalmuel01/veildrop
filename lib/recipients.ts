import Papa from "papaparse";
import { isAddress, getAddress } from "viem";
import { toBaseUnits } from "./amount";

export interface RecipientRow {
  id: string;
  address: string;
  amountDisplay: string;
  amountRaw: bigint;
  isValidAddress: boolean;
  isDuplicate: boolean;
  isValidAmount: boolean;
}

function makeId() {
  return crypto.randomUUID();
}

function validateAddress(address: string): boolean {
  const trimmed = address.trim();
  if (!isAddress(trimmed, { strict: false })) return false;
  // Reject mixed-case addresses whose case doesn't match the EIP-55 checksum —
  // usually a copy/paste typo rather than an intentional all-lowercase address.
  const isAllLower = trimmed === trimmed.toLowerCase();
  const isAllUpper = trimmed === trimmed.toUpperCase();
  if (isAllLower || isAllUpper) return true;
  try {
    return getAddress(trimmed) === trimmed;
  } catch {
    return false;
  }
}

function buildRow(address: string, amountDisplay: string): RecipientRow {
  const amountRaw = toBaseUnits(amountDisplay);
  return {
    id: makeId(),
    address: address.trim(),
    amountDisplay: amountDisplay.trim(),
    amountRaw,
    isValidAddress: validateAddress(address),
    isDuplicate: false,
    isValidAmount: amountRaw > 0n,
  };
}

/** Recompute per-row duplicate flags across the full set (address, case-insensitive). */
export function markDuplicates(rows: RecipientRow[]): RecipientRow[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = row.address.toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return rows.map((row) => ({
    ...row,
    isDuplicate: (counts.get(row.address.toLowerCase()) ?? 0) > 1,
  }));
}

const HEADER_HINTS = ["address", "amount", "wallet", "recipient"];

/** Parse a CSV string of `address,amount` rows, tolerating an optional header row. */
export function parseRecipientsCsv(csvText: string): RecipientRow[] {
  const result = Papa.parse<string[]>(csvText, { skipEmptyLines: true });
  const rows = result.data;
  if (rows.length === 0) return [];

  const [first] = rows;
  const looksLikeHeader = first.some((cell) =>
    HEADER_HINTS.some((hint) => cell.trim().toLowerCase().includes(hint)),
  );
  const dataRows = looksLikeHeader ? rows.slice(1) : rows;

  const parsed = dataRows
    .filter((cols) => cols.some((c) => c.trim() !== ""))
    .map((cols) => buildRow(cols[0] ?? "", cols[1] ?? ""));

  return markDuplicates(parsed);
}

export function addManualRecipient(rows: RecipientRow[], address: string, amountDisplay: string): RecipientRow[] {
  return markDuplicates([...rows, buildRow(address, amountDisplay)]);
}

export function updateRecipient(
  rows: RecipientRow[],
  id: string,
  patch: { address?: string; amountDisplay?: string },
): RecipientRow[] {
  const next = rows.map((row) => {
    if (row.id !== id) return row;
    const address = patch.address ?? row.address;
    const amountDisplay = patch.amountDisplay ?? row.amountDisplay;
    return { ...buildRow(address, amountDisplay), id: row.id };
  });
  return markDuplicates(next);
}

export function removeRecipient(rows: RecipientRow[], id: string): RecipientRow[] {
  return markDuplicates(rows.filter((row) => row.id !== id));
}

export function isRowValid(row: RecipientRow): boolean {
  return row.isValidAddress && row.isValidAmount && !row.isDuplicate;
}

export interface RecipientsSummary {
  total: number;
  valid: number;
  invalid: number;
  totalAmountRaw: bigint;
}

export function summarizeRecipients(rows: RecipientRow[]): RecipientsSummary {
  let valid = 0;
  let totalAmountRaw = 0n;
  for (const row of rows) {
    if (isRowValid(row)) {
      valid += 1;
      totalAmountRaw += row.amountRaw;
    }
  }
  return { total: rows.length, valid, invalid: rows.length - valid, totalAmountRaw };
}
