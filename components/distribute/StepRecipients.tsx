"use client";

import { useState } from "react";
import { CsvUploader } from "@/components/distribute/CsvUploader";
import { RecipientsTable } from "@/components/distribute/RecipientsTable";
import { AddressBookPanel } from "@/components/distribute/AddressBookPanel";
import { addManualRecipient, isRowValid, parseRecipientsCsv, type RecipientRow } from "@/lib/recipients";

export function StepRecipients({
  rows,
  onChange,
  tokenSymbol,
  recipientLabel,
  ownerAddress,
  addressBookFirst,
}: {
  rows: RecipientRow[];
  onChange: (rows: RecipientRow[]) => void;
  tokenSymbol: string;
  recipientLabel: string;
  ownerAddress?: string;
  addressBookFirst?: boolean;
}) {
  const [importSummary, setImportSummary] = useState<{ total: number; invalid: number } | null>(null);

  function handleCsvParsed(csv: string) {
    const parsed = parseRecipientsCsv(csv);
    setImportSummary({ total: parsed.length, invalid: parsed.filter((row) => !isRowValid(row)).length });
    onChange(parsed);
  }

  function handleAddFromBook(address: string, amountDisplay: string) {
    onChange(addManualRecipient(rows, address, amountDisplay));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900">Add recipients</h2>
        <p className="mt-1 text-sm text-ink-500">
          Upload a CSV of <span className="font-mono">address,amount</span>, or add them one at a time.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <CsvUploader onParsed={handleCsvParsed} />
        {importSummary && (
          <div className="rounded-xl border border-ink-900/[0.06] bg-paper-100 px-4 py-3 text-sm text-ink-500">
            Imported <span className="font-semibold text-ink-900">{importSummary.total}</span> rows
            {importSummary.invalid > 0 ? (
              <>
                {" "}
                with <span className="font-semibold text-error-600">{importSummary.invalid}</span> needing attention.
              </>
            ) : (
              <> with no validation issues.</>
            )}
          </div>
        )}
      </div>

      <AddressBookPanel
        ownerAddress={ownerAddress}
        existingAddresses={rows.map((r) => r.address)}
        onAdd={handleAddFromBook}
        defaultExpanded={addressBookFirst}
      />

      <RecipientsTable
        rows={rows}
        onChange={onChange}
        tokenSymbol={tokenSymbol}
        recipientLabel={recipientLabel}
      />
    </div>
  );
}
