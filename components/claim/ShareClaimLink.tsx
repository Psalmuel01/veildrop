"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, MessageSquareText, QrCode } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { patchRecipient } from "@/lib/api";

export function ShareClaimLink({
  url,
  recipientId,
  copied,
  onCopy,
}: {
  url: string;
  recipientId?: string;
  copied?: boolean;
  onCopy?: () => void;
}) {
  const { push: toast } = useToast();
  const [showQr, setShowQr] = useState(false);

  function markNotified() {
    if (recipientId) patchRecipient(recipientId, { notifiedAt: true }).catch(() => null);
  }

  function copyLink() {
    navigator.clipboard.writeText(url);
    toast({ kind: "success", title: "Claim link copied" });
    markNotified();
    onCopy?.();
  }

  function copyMessage() {
    const message = `You have a confidential distribution waiting on VeilDrop. Connect your wallet at ${url} to view and claim it.`;
    navigator.clipboard.writeText(message);
    toast({ kind: "success", title: "Message copied" });
    markNotified();
    onCopy?.();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <button
          onClick={copyLink}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-accent-600 hover:bg-accent-100"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? "Copied" : "Copy link"}
        </button>
        <button
          onClick={copyMessage}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-ink-500 hover:bg-ink-900/5"
          title="Copy a shareable message"
        >
          <MessageSquareText className="size-3" />
          Message
        </button>
        <button
          onClick={() => setShowQr((v) => !v)}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-ink-500 hover:bg-ink-900/5"
          title="Show QR code"
        >
          <QrCode className="size-3" />
          QR
        </button>
      </div>
      {showQr && (
        <div className="flex justify-center rounded-lg border border-ink-900/[0.06] bg-paper-50 p-3">
          <QRCodeSVG value={url} size={128} bgColor="#FCFAF5" fgColor="#1C1811" marginSize={2} />
        </div>
      )}
    </div>
  );
}
