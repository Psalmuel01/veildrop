"use client";

import { cn } from "@/lib/cn";

function formatDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

/**
 * Horizontal locked to unlocking timeline for a vesting schedule. Used both
 * as a preview in the wizard's review step (startTimestamp defaults to now,
 * since the schedule does not exist on-chain yet) and, fed real on-chain
 * timestamps, as a live progress view on the recipient page and the admin
 * dashboard row.
 */
export function VestingScheduleTimeline({
  startTimestamp,
  cliffSeconds,
  vestingSeconds,
  compact,
}: {
  startTimestamp?: number;
  cliffSeconds: number;
  vestingSeconds: number;
  compact?: boolean;
}) {
  const start = startTimestamp ?? Math.floor(Date.now() / 1000);
  const total = Math.max(cliffSeconds + vestingSeconds, 1);
  const cliffPct = (cliffSeconds / total) * 100;
  const vestingPct = 100 - cliffPct;
  const now = Math.floor(Date.now() / 1000);
  const elapsed = Math.min(Math.max(now - start, 0), total);
  const progressPct = (elapsed / total) * 100;

  const cliffEnd = start + cliffSeconds;
  const vestingEnd = start + cliffSeconds + vestingSeconds;
  const markers = [25, 50, 75, 100];

  return (
    <div className={cn("flex flex-col gap-2", compact && "gap-1")}>
      <div className={cn("relative h-3 w-full overflow-hidden rounded-full bg-ink-900/[0.06]", compact && "h-2")}>
        <div
          className="absolute inset-y-0 left-0 bg-ink-900/20"
          style={{ width: `${cliffPct}%` }}
          title="Locked (cliff)"
        />
        <div
          className="absolute inset-y-0 bg-accent-100"
          style={{ left: `${cliffPct}%`, width: `${vestingPct}%` }}
          title="Unlocking linearly"
        />
        {markers.map((m) => (
          <div
            key={m}
            className="absolute inset-y-0 w-px bg-paper-50/70"
            style={{ left: `${cliffPct + (vestingPct * m) / 100}%` }}
          />
        ))}
        <div
          className="absolute inset-y-0 w-0.5 bg-accent-600"
          style={{ left: `${Math.min(progressPct, 100)}%` }}
          title="Now"
        />
      </div>
      {!compact && (
        <div className="flex items-center justify-between text-[11px] text-ink-500">
          <span>Locked until {formatDate(cliffEnd)}</span>
          <span>Fully vested {formatDate(vestingEnd)}</span>
        </div>
      )}
    </div>
  );
}
