# VeilDrop

Confidential token distribution on Ethereum — payroll, grants, investor allocations, and
airdrops where recipient addresses are public but the **amount** each address receives is
encrypted end to end, using Fully Homomorphic Encryption (FHE). Nobody but the recipient can
ever see how much they were sent.

Built on [Zama's](https://www.zama.org) FHE protocol via the [TokenOps SDK](https://docs.tokenops.xyz),
against pre-deployed, audited contracts. This repo is a frontend only — no smart contracts are
written or deployed here.

Runs on **Sepolia testnet only**.

## Requirements

- **Node ≥ 22** (required by `@zama-fhe/sdk`; see `.nvmrc`)
- [pnpm](https://pnpm.io)
- A browser wallet (MetaMask or similar) with an injected provider, switched to Sepolia

## Getting started

```bash
nvm use          # or otherwise ensure Node 22+
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000), connect a wallet on Sepolia, and mint test
CTTT from [`/faucet`](http://localhost:3000/faucet) before creating a distribution.

### Environment variables

None are required to run locally — the app falls back to a public Sepolia RPC. Optionally:

```bash
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://your-rpc-url   # override the default public RPC
```

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/distribute` | Wizard: create a Disperse (push) or Airdrop (claim) distribution |
| `/dashboard`, `/dashboard/[id]` | Distributions created by the connected wallet (localStorage, per-address) |
| `/claim?payload=...` | Recipient claim portal — decrypt and claim an Airdrop allocation |
| `/faucet` | Mint testnet CTTT |
| `/docs` | In-app documentation |

## Architecture notes

- **Two distribution modes**, both from `@tokenops/sdk`: `fhe-disperse` (single push transaction,
  admin pays gas, recipients do nothing) and `fhe-airdrop` (admin funds a pool and signs a claim
  authorization per recipient; recipients claim on their own schedule via a stateless link with the
  claim payload base64-encoded in the URL — no backend).
- **Encryption/decryption** goes through `@zama-fhe/react-sdk`'s `ZamaProvider`. It requires a live
  `walletClient`, so it only mounts once a wallet is connected on Sepolia — see `useIsZamaReady()`
  in `app/providers.tsx`. Components that call Zama hooks must gate on that flag, not on
  `isConnected` alone, or they can mount before the provider during the connection race.
- **`lib/encryptor-adapter.ts`** bridges a real shape mismatch between the two SDKs at their
  currently published versions: `@tokenops/sdk`'s `Encryptor` expects
  `{ handles: Uint8Array[], inputProof: Uint8Array }`, but `@zama-fhe/sdk@3.2.0`'s relayer returns
  `{ encryptedValues: Hex[], inputProof: Hex }`. Both SDKs' own quickstart examples don't type-check
  against each other as published — this adapter is required, not optional.
- **Fonts are self-hosted** (`next/font/local`, files under `app/fonts/`) rather than
  `next/font/google` — in some sandboxed/restricted-network environments the Next dev server's font
  fetch silently falls back to a generic font with no build error. Self-hosting sidesteps that.
- **Wallet-mode Disperse needs two separate approvals**, not one: the admin's subwallets must
  approve the Disperse singleton (`register()` / `useApproveTokenOnWallets`), *and* the admin's own
  balance must separately approve the singleton as operator (`useConfidentialSetOperator`) — wallet
  mode pulls the total from the admin's balance into their subwallets before fanning out. Skipping
  the second approval reverts on-chain with `ERC7984UnauthorizedSpender`.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind · wagmi/viem · TanStack Query · `@tokenops/sdk` ·
`@zama-fhe/sdk` / `@zama-fhe/react-sdk` · Framer Motion
