export const CTTT_DECIMALS = 6;

/** Convert a human-readable display amount (e.g. "1,000.5") to CTTT base units (6 decimals). */
export function toBaseUnits(display: string | number): bigint {
  const normalized = typeof display === "number" ? display.toString() : display.replace(/,/g, "").trim();
  if (normalized === "" || Number.isNaN(Number(normalized))) return 0n;

  const negative = normalized.startsWith("-");
  const unsigned = negative ? normalized.slice(1) : normalized;
  const [whole, fraction = ""] = unsigned.split(".");
  const paddedFraction = (fraction + "0".repeat(CTTT_DECIMALS)).slice(0, CTTT_DECIMALS);
  const raw = BigInt((whole || "0") + paddedFraction || "0");
  return negative ? -raw : raw;
}

/** Format raw CTTT base units (6 decimals) into a human-readable display string. */
export function formatAmount(raw: bigint, options?: { maxFractionDigits?: number }): string {
  const maxFractionDigits = options?.maxFractionDigits ?? CTTT_DECIMALS;
  const negative = raw < 0n;
  const abs = negative ? -raw : raw;
  const divisor = 10n ** BigInt(CTTT_DECIMALS);
  const whole = abs / divisor;
  const fraction = abs % divisor;

  let fractionStr = fraction.toString().padStart(CTTT_DECIMALS, "0").slice(0, maxFractionDigits);
  fractionStr = fractionStr.replace(/0+$/, "");

  const wholeStr = whole.toLocaleString("en-US");
  const sign = negative ? "-" : "";
  return fractionStr ? `${sign}${wholeStr}.${fractionStr}` : `${sign}${wholeStr}`;
}
