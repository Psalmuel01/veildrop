"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Check, Copy, Download, ExternalLink, Files } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const SEPOLIA_EXPLORER = "https://sepolia.etherscan.io/tx/";

export interface ClaimLinkEntry {
  address: string;
  amountDisplay: string;
  url: string;
}

export function StepSuccess({
  mode,
  txHash,
  recipientCount,
  claimLinks,
}: {
  mode: "disperse" | "airdrop";
  txHash: string;
  recipientCount: number;
  claimLinks?: ClaimLinkEntry[];
}) {
  const { push: toast } = useToast();
  const [copiedLinks, setCopiedLinks] = useState<Set<string>>(() => new Set());
  const [hasExportedLinks, setHasExportedLinks] = useState(mode !== "airdrop");

  useEffect(() => {
    if (mode !== "airdrop" || hasExportedLinks) return;
    function warnBeforeLeave(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", warnBeforeLeave);
    return () => window.removeEventListener("beforeunload", warnBeforeLeave);
  }, [hasExportedLinks, mode]);

  useEffect(() => {
    if (claimLinks && copiedLinks.size === claimLinks.length) setHasExportedLinks(true);
  }, [claimLinks, copiedLinks]);

  function escapeCsv(value: string) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  function copyLink(url: string) {
    navigator.clipboard.writeText(url);
    setCopiedLinks((prev) => new Set(prev).add(url));
    toast({ kind: "success", title: "Claim link copied" });
  }

  function copyAllLinks() {
    if (!claimLinks) return;
    // Pure URLs only, one per line, so each is directly usable on its own
    // (e.g. pasted straight into a browser or messaging app). The address
    // mapping lives in the CSV download instead.
    navigator.clipboard.writeText(claimLinks.map((c) => c.url).join("\n"));
    setCopiedLinks(new Set(claimLinks.map((c) => c.url)));
    setHasExportedLinks(true);
    toast({ kind: "success", title: "All claim links copied" });
  }

  function downloadAllLinks() {
    if (!claimLinks) return;
    const csv = [
      "address,amount,claim_url",
      ...claimLinks.map((c) => [c.address, c.amountDisplay, c.url].map(escapeCsv).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "veildrop-claim-links.csv";
    a.click();
    URL.revokeObjectURL(url);
    setHasExportedLinks(true);
    toast({ kind: "success", title: "Claim links downloaded" });
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-success-100 text-success-700">
        <CheckCircle2 className="size-7" />
      </div>
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900">
          {mode === "disperse" ? "Tokens dispersed" : "Airdrop is live"}
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          {mode === "disperse"
            ? `Pushed to ${recipientCount} recipients. Amounts stay encrypted on-chain.`
            : `${recipientCount} claim links generated. Share one with each recipient.`}
        </p>
      </div>

      <a
        href={`${SEPOLIA_EXPLORER}${txHash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-lg border border-ink-900/[0.08] px-4 py-2 font-mono text-xs text-ink-700 hover:border-ink-900/[0.22]"
      >
        {txHash.slice(0, 10)}…{txHash.slice(-8)}
        <ExternalLink className="size-3.5" />
      </a>

      {mode === "airdrop" && claimLinks && (
        <div className="w-full text-left">
          {!hasExportedLinks && (
            <div className="mb-3 rounded-xl border border-accent-600/25 bg-accent-100/40 px-4 py-3 text-sm text-ink-700">
              Save these links now. Each recipient needs their own link to claim.
            </div>
          )}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-medium text-ink-900">Claim links</h3>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={copyAllLinks}>
                <Files className="size-3.5" />
                Copy all
              </Button>
              <Button size="sm" variant="secondary" onClick={downloadAllLinks}>
                <Download className="size-3.5" />
                Download CSV
              </Button>
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto rounded-xl border border-ink-900/[0.06]">
            {claimLinks.map((c) => (
              <div
                key={c.address}
                className="flex items-center justify-between gap-3 border-b border-ink-900/[0.04] px-4 py-2.5 last:border-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs text-ink-900">{c.address}</p>
                  <p className="text-[11px] text-ink-500">{c.amountDisplay}</p>
                </div>
                <button
                  onClick={() => copyLink(c.url)}
                  className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs text-accent-600 hover:bg-accent-100"
                >
                  {copiedLinks.has(c.url) ? <Check className="size-3" /> : <Copy className="size-3" />}
                  {copiedLinks.has(c.url) ? "Copied" : "Copy link"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Link href="/dashboard">
          <Button variant="secondary">View dashboard</Button>
        </Link>
        <Link href="/distribute">
          <Button variant="ghost">Create another</Button>
        </Link>
      </div>
    </div>
  );
}
