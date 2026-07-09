"use client";

import { useEffect, useState } from "react";
import { BookUser, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { listAddressBook, type AddressBookEntryDto } from "@/lib/api";

export function AddressBookPanel({
  ownerAddress,
  existingAddresses,
  onAdd,
}: {
  ownerAddress?: string;
  existingAddresses: string[];
  onAdd: (address: string, amountDisplay: string) => void;
}) {
  const [entries, setEntries] = useState<AddressBookEntryDto[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!ownerAddress) return;
    listAddressBook(ownerAddress).then(setEntries);
  }, [ownerAddress]);

  if (entries.length === 0) return null;

  const existing = new Set(existingAddresses.map((a) => a.toLowerCase()));

  return (
    <div className="rounded-xl border border-ink-900/[0.06] bg-paper-50">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-ink-900">
          <BookUser className="size-4 text-accent-600" />
          Address book
          <span className="rounded-full bg-ink-900/5 px-2 py-0.5 text-xs font-normal text-ink-500">
            {entries.length}
          </span>
        </span>
        {expanded ? <ChevronUp className="size-4 text-ink-500" /> : <ChevronDown className="size-4 text-ink-500" />}
      </button>
      {expanded && (
        <div className="flex max-h-56 flex-col gap-1 overflow-y-auto border-t border-ink-900/[0.06] p-2">
          {entries.map((entry) => {
            const alreadyAdded = existing.has(entry.address.toLowerCase());
            return (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 hover:bg-ink-900/[0.03]"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-ink-900">
                    {entry.label || `${entry.address.slice(0, 8)}…${entry.address.slice(-6)}`}
                  </p>
                  <p className="truncate font-mono text-[11px] text-ink-500">{entry.address}</p>
                </div>
                <button
                  onClick={() => onAdd(entry.address, entry.lastAmount ?? "")}
                  disabled={alreadyAdded}
                  className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs text-accent-600 hover:bg-accent-100 disabled:cursor-not-allowed disabled:text-ink-500 disabled:hover:bg-transparent"
                >
                  <Plus className="size-3" />
                  {alreadyAdded ? "Added" : "Add"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
