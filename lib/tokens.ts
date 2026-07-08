import deployedVeilToken from "../contracts/deployments/sepolia.json";

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
    address: "0xC1b633b0b066e8cCDdCbFE14E88d89A0a9B64f5a",
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
