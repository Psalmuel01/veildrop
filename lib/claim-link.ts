export interface ClaimPayload {
  airdrop: `0x${string}`;
  recipient: `0x${string}`;
  handle: `0x${string}`;
  inputProof: `0x${string}`;
  signature: `0x${string}`;
}

// This page is server-rendered first (Next.js SSR of "use client" pages),
// where `window` doesn't exist. Base64 (de)coding must work in both Node
// and the browser rather than reaching for window.btoa/atob directly.
function toBase64(input: string): string {
  if (typeof window !== "undefined") return window.btoa(input);
  return Buffer.from(input, "utf-8").toString("base64");
}

function fromBase64(input: string): string {
  if (typeof window !== "undefined") return window.atob(input);
  return Buffer.from(input, "base64").toString("utf-8");
}

export function encodeClaimPayload(payload: ClaimPayload): string {
  const base64 = toBase64(JSON.stringify(payload));
  return encodeURIComponent(base64);
}

export function decodeClaimPayload(encoded: string): ClaimPayload | null {
  try {
    const json = fromBase64(decodeURIComponent(encoded));
    return JSON.parse(json) as ClaimPayload;
  } catch {
    return null;
  }
}

export function buildClaimUrl(payload: ClaimPayload): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/claim?payload=${encodeClaimPayload(payload)}`;
}
