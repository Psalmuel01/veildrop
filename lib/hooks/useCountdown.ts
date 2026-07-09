"use client";

import { useEffect, useState } from "react";

export interface Countdown {
  expired: boolean;
  label: string;
}

/** Ticking countdown to a target ISO date, or null when there is nothing to count down to. */
export function useCountdown(targetIso: string | null | undefined): Countdown | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!targetIso) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [targetIso]);

  if (!targetIso) return null;

  const target = new Date(targetIso).getTime();
  const diffMs = target - now;
  if (diffMs <= 0) return { expired: true, label: "Expired" };

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const label =
    days > 0
      ? `${days}d ${hours}h remaining`
      : hours > 0
        ? `${hours}h ${minutes}m remaining`
        : `${minutes}m ${seconds}s remaining`;

  return { expired: false, label };
}
