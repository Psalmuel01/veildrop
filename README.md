<p align="center">
  <img src="https://img.shields.io/badge/Network-Sepolia%20Testnet-8b5cf6?style=flat-square" />
  <img src="https://img.shields.io/badge/Node-%E2%89%A522-339933?style=flat-square&logo=nodedotjs" />
  <img src="https://img.shields.io/badge/Built%20with-FHE-0ea5e9?style=flat-square" />
  <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=nextdotjs" />
</p>

<h1 align="center">VeilDrop</h1>

<p align="center">
  <strong>Confidential token distribution, powered by Fully Homomorphic Encryption.</strong><br/>
  Recipient addresses are public. Amounts are not.
</p>

---

## What is VeilDrop?

VeilDrop lets you distribute tokens to any number of recipients with **fully encrypted allocations**. No one — not block explorers, not other recipients, not even VeilDrop itself — can see how much each address received. Only the recipient, using their wallet, can decrypt their own allocation.

This makes VeilDrop suitable for:

- **Payroll** — pay contributors without leaking salary data on-chain
- **Grants** — distribute grant amounts privately
- **Investor allocations** — fund rounds without revealing per-investor token amounts
- **Airdrops** — drop tokens to a community without public enumeration of amounts

Confidentiality is enforced at the protocol level using [Zama's](https://www.zama.org) Fully Homomorphic Encryption (FHE), via the [ERC-7984](https://eips.ethereum.org/EIPS/eip-7984) confidential token standard. VeilDrop integrates with the [TokenOps SDK](https://docs.tokenops.xyz) and ships its own ERC-7984 demo token, **vCTT** (`VeilToken`).

> **Testnet only** — VeilDrop currently runs on Ethereum **Sepolia** testnet.

---

## Supported Tokens

| Token | Address | Description |
|-------|---------|-------------|
| **vCTT** (VeilToken) | [`0x1c20CeC1...670A42`](https://sepolia.etherscan.io/address/0x1c20CeC11BbfDB19f88450569Ed7a98A7a670A42) | VeilDrop's own ERC-7984 demo token, deployed and owned by this repo |
| **CTTT** | TokenOps default | TokenOps' canonical confidential test token, useful for testers already on the platform |

---

## Distribution Modes

VeilDrop supports two on-chain distribution strategies, both powered by `@tokenops/sdk`:

### Disperse (Push)
Admin sends tokens to all recipients in a single transaction. Recipients receive tokens automatically — no action required on their end. The admin pays gas for the full distribution.

### Airdrop (Claim)
Admin funds a pool and signs a per-recipient claim authorization off-chain. Recipients receive a stateless claim link containing their encrypted payload, and claim on their own schedule. No backend required — the full claim data is encoded in the URL.

---

## Getting Started

### Prerequisites

- **Node ≥ 22** (required by `@zama-fhe/sdk` — see `.nvmrc`)
- [pnpm](https://pnpm.io)
- A browser wallet (MetaMask or compatible) connected to **Sepolia**

### Installation

```bash
# Use the correct Node version
nvm use

# Install dependencies
pnpm install

# Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000), connect your wallet on Sepolia, and mint testnet tokens from the [/faucet](http://localhost:3000/faucet) before creating a distribution.

### Environment Variables

```bash
# .env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

`DATABASE_URL` is required, VeilDrop uses Postgres (via Prisma) for distribution history, recipient claim state, drafts, and the address book. Any Postgres works, including a local instance or a free tier on [Neon](https://neon.tech) or [Supabase](https://supabase.com).

```bash
# .env.local, optional
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://your-rpc-endpoint
```

### Database setup

```bash
npx prisma migrate dev
```

Applies the schema in `prisma/schema.prisma` and generates the Prisma client.

---

## App Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/distribute` | Create a new Disperse or Airdrop distribution |
| `/dashboard` | All distributions created by the connected wallet |
| `/dashboard/[id]` | Detail view for a specific distribution |
| `/claim?payload=...` | Recipient claim portal — decrypt and claim an Airdrop allocation |
| `/faucet` | Mint testnet tokens (vCTT or CTTT) |
| `/docs` | In-app documentation |

---

## Architecture

### FHE Provider & Readiness
Encryption and decryption go through `@zama-fhe/react-sdk`'s `ZamaProvider`. The provider only mounts after a wallet is connected on Sepolia. Components that call Zama hooks must gate on `useIsZamaReady()` (see `app/providers.tsx`) — not just `isConnected` — to avoid mounting before the provider is ready during the connection handshake.

### Encryptor Adapter
`lib/encryptor-adapter.ts` bridges a shape mismatch between `@tokenops/sdk` and `@zama-fhe/sdk` at their currently published versions:
- `@tokenops/sdk`'s `Encryptor` expects `{ handles: Uint8Array[], inputProof: Uint8Array }`
- `@zama-fhe/sdk@3.2.0`'s relayer returns `{ encryptedValues: Hex[], inputProof: Hex }`

This adapter is **required**, not optional.

### Disperse: Two-Step Approval
Wallet-mode Disperse requires two separate approvals:
1. Each subwallet must approve the Disperse singleton via `register()` / `useApproveTokenOnWallets`
2. The admin's own balance must separately approve the singleton as operator via `useConfidentialSetOperator`

Skipping the second step reverts on-chain with `ERC7984UnauthorizedSpender`.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Blockchain | wagmi · viem |
| Data fetching | TanStack Query |
| FHE | `@zama-fhe/sdk` · `@zama-fhe/react-sdk` |
| Token ops | `@tokenops/sdk` |
| Animations | Framer Motion |

---

## Contracts

The `contracts/` workspace contains the `VeilToken` ERC-7984 source. See [`contracts/contracts/VeilToken.sol`](contracts/contracts/VeilToken.sol).

Sepolia deployment: [`0x1c20CeC11BbfDB19f88450569Ed7a98A7a670A42`](https://sepolia.etherscan.io/address/0x1c20CeC11BbfDB19f88450569Ed7a98A7a670A42)

---

<p align="center">Built on <a href="https://www.zama.org">Zama FHE</a> · <a href="https://docs.tokenops.xyz">TokenOps SDK</a></p>
