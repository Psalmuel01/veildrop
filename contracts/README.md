# VeilDrop contracts

VeilToken (vCTT), VeilDrop's own confidential ERC-7984 token. Deployed and
controlled by this repo, separate from TokenOps' CTTT test token that the
frontend also supports.

This is a standalone Hardhat project, not part of the Next.js app's pnpm
workspace. It uses npm and Node 22 or later.

## Setup

```bash
cd contracts
npm install
cp .env.example .env
# fill in SEPOLIA_RPC_URL and SEPOLIA_PRIVATE_KEY in .env
```

`SEPOLIA_PRIVATE_KEY` is the deployer wallet's private key. It needs Sepolia
ETH for gas. Never commit `.env`, it is gitignored.

## Compile and test

```bash
npm run compile
npm test
```

Tests run against a local FHEVM mock coprocessor (`fhevm.isMock`), so no
network or funds are required. They cover minting, metadata, confidential
transfers, and operator approval.

## Deploy to Sepolia

```bash
npm run deploy:sepolia
```

This deploys VeilToken and writes `deployments/sepolia.json` with the
deployed address, transaction hash, timestamp, and network. That file is the
input the frontend reads to enable vCTT as a distribution token.
