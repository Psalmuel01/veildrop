import { requireConfidentialTestTokenAddress } from "@tokenops/sdk";
import deployedVeilToken from "../contracts/deployments/sepolia.json";

// This app only ever runs against Sepolia, see lib/wagmi.ts.
const SEPOLIA_CHAIN_ID = 11155111;

export interface TokenConfig {
    id: string;
    name: string;
    symbol: string;
    address: `0x${string}`;
    decimals: number;
    description: string;
}

export const VEIL_TOKEN: TokenConfig = {
    id: "veil",
    name: "VeilDrop Confidential Token",
    symbol: "vCTT",
    address: deployedVeilToken.address as `0x${string}`,
    decimals: 6,
    description: "Deployed and operated by VeilDrop. Demonstrates full smart contract ownership.",
};

export const CTTT_TOKEN: TokenConfig = {
    id: "cttt",
    name: "TokenOps Test Token",
    symbol: "CTTT",
    address: requireConfidentialTestTokenAddress(SEPOLIA_CHAIN_ID),
    decimals: 6,
    description: "TokenOps' widely recognized confidential test token.",
};

export const SUPPORTED_TOKENS = [VEIL_TOKEN, CTTT_TOKEN] as const;

export function getTokenConfig(tokenId: string | undefined): TokenConfig {
    return SUPPORTED_TOKENS.find((t) => t.id === tokenId) ?? VEIL_TOKEN;
}

export function getTokenConfigByAddress(address: `0x${string}`): TokenConfig | undefined {
    return SUPPORTED_TOKENS.find((t) => t.address.toLowerCase() === address.toLowerCase());
}
