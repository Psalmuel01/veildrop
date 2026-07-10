"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, LockOpen, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";

type Status = "masked" | "decrypting" | "revealed";

export function RevealAmount({
  status,
  value,
  symbol,
  onDecrypt,
  className,
}: {
  status: Status;
  value?: string;
  symbol: string;
  onDecrypt: () => void;
  className?: string;
}) {
  const [justRevealed, setJustRevealed] = useState(false);

  return (
    <div className={cn("flex flex-col items-center gap-2.5 text-center", className)}>
      <div
        className={cn(
          "relative flex min-h-24 items-center justify-center rounded-2xl px-8 py-6",
          status === "revealed" && justRevealed && "animate-reveal-glow",
        )}
      >
        <AnimatePresence mode="wait" onExitComplete={() => setJustRevealed(true)}>
          {status !== "revealed" ? (
            <motion.div
              key="masked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: "blur(6px)" }}
              transition={{ duration: 0.35 }}
              className="flex items-center gap-3"
            >
              <Lock className="size-6 text-ink-500" />
              <span className="encrypted-mask font-display text-5xl font-semibold tracking-tight">
                ••••••
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="revealed"
              initial={{ opacity: 0, filter: "blur(10px)", scale: 0.94 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-baseline gap-2"
            >
              <LockOpen className="size-6 self-center text-success-600" />
              <span className="font-mono text-5xl font-semibold tabular-nums tracking-tight text-ink-900">
                {value}
              </span>
              <span className="text-lg font-medium text-ink-500">{symbol}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {status !== "revealed" && (
        <Button size="md" onClick={onDecrypt} isLoading={status === "decrypting"}>
          {status === "decrypting" ? "Decrypting" : "Decrypt allocation"}
        </Button>
      )}

      {status === "decrypting" && (
        <p className="flex items-center gap-1.5 text-xs text-ink-500">
          <Loader2 className="size-3 animate-spin" />
          Verifying with your wallet signature…
        </p>
      )}
    </div>
  );
}
