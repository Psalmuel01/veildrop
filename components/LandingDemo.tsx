"use client";

import { useState } from "react";
import { RevealAmount } from "@/components/RevealAmount";

export function LandingDemo() {
  const [status, setStatus] = useState<"masked" | "decrypting" | "revealed">("masked");

  function handleDecrypt() {
    setStatus("decrypting");
    setTimeout(() => setStatus("revealed"), 900);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <RevealAmount status={status} value="42,500.00" symbol="CTTT" onDecrypt={handleDecrypt} />
      {status === "revealed" && (
        <button
          onClick={() => setStatus("masked")}
          className="text-xs font-medium text-ink-500 underline underline-offset-2 hover:text-ink-900"
        >
          Reset demo
        </button>
      )}
    </div>
  );
}
