"use client";

import Link from "next/link";
import { CheckCircle2, ExternalLink, Copy, Download } from "lucide-react";
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

  function copyLink(url: string) {
    navigator.clipboard.writeText(url);
    toast({ kind: "success", title: "Claim link copied" });
  }

  function downloadAllLinks() {
    if (!claimLinks) return;
    const csv = ["address,amount,claim_url", ...claimLinks.map((c) => `${c.address},${c.amountDisplay},${c.url}`)].join(
      "\n",
    );
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "veildrop-claim-links.csv";
    a.click();
    URL.revokeObjectURL(url);
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
        className="flex items-center gap-1.5 rounded-lg border border-ink-900/15 px-4 py-2 font-mono text-xs text-ink-700 hover:border-ink-900/30"
      >
        {txHash.slice(0, 10)}…{txHash.slice(-8)}
        <ExternalLink className="size-3.5" />
      </a>

      {mode === "airdrop" && claimLinks && (
        <div className="w-full text-left">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-ink-900">Claim links</h3>
            <Button size="sm" variant="secondary" onClick={downloadAllLinks}>
              <Download className="size-3.5" />
              Download all as CSV
            </Button>
          </div>
          <div className="max-h-72 overflow-y-auto rounded-xl border border-ink-900/10">
            {claimLinks.map((c) => (
              <div
                key={c.address}
                className="flex items-center justify-between gap-3 border-b border-ink-900/6 px-4 py-2.5 last:border-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs text-ink-900">{c.address}</p>
                  <p className="text-[11px] text-ink-500">{c.amountDisplay}</p>
                </div>
                <button
                  onClick={() => copyLink(c.url)}
                  className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs text-accent-600 hover:bg-accent-100"
                >
                  <Copy className="size-3" />
                  Copy link
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
