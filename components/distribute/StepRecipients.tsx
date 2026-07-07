"use client";

import { CsvUploader } from "@/components/distribute/CsvUploader";
import { RecipientsTable } from "@/components/distribute/RecipientsTable";
import { parseRecipientsCsv, type RecipientRow } from "@/lib/recipients";

export function StepRecipients({
  rows,
  onChange,
  tokenSymbol,
  recipientLabel,
}: {
  rows: RecipientRow[];
  onChange: (rows: RecipientRow[]) => void;
  tokenSymbol: string;
  recipientLabel: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink-900">Add recipients</h2>
        <p className="mt-1 text-sm text-ink-500">
          Upload a CSV of <span className="font-mono">address,amount</span>, or add them one at a time.
        </p>
      </div>

      <CsvUploader onParsed={(csv) => onChange(parseRecipientsCsv(csv))} />

      <RecipientsTable
        rows={rows}
        onChange={onChange}
        tokenSymbol={tokenSymbol}
        recipientLabel={recipientLabel}
      />
    </div>
  );
}
