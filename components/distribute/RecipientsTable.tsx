"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Eraser, Plus, Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatAmount } from "@/lib/amount";
import {
  addManualRecipient,
  isRowValid,
  removeRecipient,
  summarizeRecipients,
  updateRecipient,
  type RecipientRow,
} from "@/lib/recipients";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function rowError(row: RecipientRow): string | null {
  if (!row.isValidAddress) return "Invalid address";
  if (row.isDuplicate) return "Duplicate address";
  if (!row.isValidAmount) return "Invalid amount";
  return null;
}

export function RecipientsTable({
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
  const [newAddress, setNewAddress] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"all" | "invalid">("all");
  const summary = summarizeRecipients(rows);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleRows = rows.filter((row) => {
    if (view === "invalid" && isRowValid(row)) return false;
    if (!normalizedQuery) return true;
    return row.address.toLowerCase().includes(normalizedQuery) || row.amountDisplay.toLowerCase().includes(normalizedQuery);
  });

  function handleAdd() {
    if (!newAddress.trim() || !newAmount.trim()) return;
    onChange(addManualRecipient(rows, newAddress, newAmount));
    setNewAddress("");
    setNewAmount("");
  }

  function removeInvalidRows() {
    onChange(rows.filter(isRowValid));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="sticky top-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-900/[0.06] bg-paper-100 px-4 py-3 shadow-[0_12px_24px_-20px_rgba(0,0,0,0.65)]">
        <div className="flex gap-6 text-sm">
          <span>
            <span className="font-semibold text-ink-900">{summary.total}</span>{" "}
            <span className="text-ink-500">{recipientLabel.toLowerCase()}s</span>
          </span>
          <span>
            <span className="font-mono font-semibold text-ink-900">{formatAmount(summary.totalAmountRaw)}</span>{" "}
            <span className="text-ink-500">{tokenSymbol} total</span>
          </span>
          {summary.invalid > 0 && (
            <span className="flex items-center gap-1 text-error-600">
              <AlertCircle className="size-3.5" />
              {summary.invalid} need attention
            </span>
          )}
        </div>
        {summary.invalid > 0 && (
          <Button size="sm" variant="secondary" onClick={removeInvalidRows}>
            <Eraser className="size-3.5" />
            Remove invalid
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-ink-900/[0.06] bg-paper-50 p-3 sm:flex-row sm:items-center">
        <label className="flex h-10 flex-1 items-center gap-2 rounded-lg border border-ink-900/[0.08] bg-paper-100 px-3 text-sm">
          <Search className="size-4 text-ink-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search address or amount"
            className="min-w-0 flex-1 bg-transparent text-ink-900 placeholder:text-ink-500/70 focus:outline-none"
          />
        </label>
        <div className="grid grid-cols-2 rounded-full border border-ink-900/[0.08] p-0.5 text-xs font-medium">
          <button
            onClick={() => setView("all")}
            className={cn("rounded-full px-3 py-2 text-ink-500", view === "all" && "bg-ink-900 text-paper-100")}
          >
            All rows
          </button>
          <button
            onClick={() => setView("invalid")}
            className={cn("rounded-full px-3 py-2 text-ink-500", view === "invalid" && "bg-ink-900 text-paper-100")}
          >
            Needs attention
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-ink-900/[0.06]">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="border-b border-ink-900/[0.06] bg-paper-100 text-left text-xs uppercase tracking-wide text-ink-500">
              <th className="px-4 py-2.5 font-medium">{recipientLabel} address</th>
              <th className="px-4 py-2.5 font-medium">Amount</th>
              <th className="w-10 px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {visibleRows.map((row, index) => {
                const error = rowError(row);
                return (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.3) }}
                    className={cn("border-b border-ink-900/[0.04] last:border-0", error && "bg-error-100/40")}
                  >
                    <td className="px-4 py-2">
                      <input
                        value={row.address}
                        onChange={(e) => onChange(updateRecipient(rows, row.id, { address: e.target.value }))}
                        className={cn(
                          "w-full rounded-md border-none bg-transparent font-mono text-xs focus:outline-none focus:ring-2 focus:ring-accent-600/30",
                          !row.isValidAddress && "text-error-700",
                        )}
                      />
                      {error && <p className="mt-0.5 text-[11px] text-error-600">{error}</p>}
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={row.amountDisplay}
                        onChange={(e) => onChange(updateRecipient(rows, row.id, { amountDisplay: e.target.value }))}
                        className={cn(
                          "w-full rounded-md border-none bg-transparent font-mono text-xs focus:outline-none focus:ring-2 focus:ring-accent-600/30",
                          !row.isValidAmount && "text-error-700",
                        )}
                      />
                    </td>
                    <td className="px-2 py-2 text-right">
                      <button
                        onClick={() => onChange(removeRecipient(rows, row.id))}
                        className="rounded-md p-1.5 text-ink-500 hover:bg-error-100 hover:text-error-600"
                        aria-label="Remove recipient"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-ink-500">
            No {recipientLabel.toLowerCase()}s yet. Upload a CSV or add one below.
          </div>
        )}
        {rows.length > 0 && visibleRows.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-ink-500">
            No rows match the current search and filter.
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-dashed border-ink-900/[0.08] p-3 sm:flex-row sm:items-center">
        <Input
          mono
          placeholder="0xRecipientAddress"
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
          className="flex-1"
        />
        <Input
          mono
          placeholder="Amount"
          value={newAmount}
          onChange={(e) => setNewAmount(e.target.value)}
          className="sm:w-40"
        />
        <Button variant="secondary" onClick={handleAdd} className="shrink-0">
          <Plus className="size-4" />
          Add
        </Button>
      </div>
    </div>
  );
}
