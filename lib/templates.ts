import type { LucideIcon } from "lucide-react";
import { Banknote, Users, Landmark, Gift, Megaphone } from "lucide-react";

export type DistributionMode = "disperse" | "airdrop" | "vesting";

export interface DistributionTemplate {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  defaultMode: DistributionMode;
  copy: {
    title: string;
    description: string;
    recipientLabel: string;
  };
  /** Days from now to prefill the claim window end, for airdrop templates only. */
  defaultClaimWindowDays?: number;
  /** Recipients tend to be repeat addresses, so surface the address book first. */
  addressBookFirst?: boolean;
}

export const TEMPLATES: DistributionTemplate[] = [
  {
    id: "payroll",
    name: "Payroll",
    description: "Recurring compensation, paid directly, amounts never public.",
    icon: Banknote,
    defaultMode: "disperse",
    copy: {
      title: "Payroll run",
      description: "Recurring compensation, delivered directly. Amounts stay encrypted on-chain.",
      recipientLabel: "Employee",
    },
    addressBookFirst: true,
  },
  {
    id: "dao-rewards",
    name: "DAO Rewards",
    description: "Contributor rewards pushed straight to their wallet.",
    icon: Users,
    defaultMode: "disperse",
    copy: {
      title: "Contributor rewards",
      description: "Contributor rewards for this cycle, pushed straight to their wallet.",
      recipientLabel: "Contributor",
    },
  },
  {
    id: "investor",
    name: "Investor Distribution",
    description: "Allocations delivered privately, no front running your unlock.",
    icon: Landmark,
    defaultMode: "disperse",
    copy: {
      title: "Investor distribution",
      description: "Investor allocation, delivered privately with no front running your unlock.",
      recipientLabel: "Investor",
    },
  },
  {
    id: "grants",
    name: "Grants",
    description: "Program grants recipients claim on their own schedule.",
    icon: Gift,
    defaultMode: "airdrop",
    copy: {
      title: "Grant round",
      description: "Grant round recipients can claim on their own schedule.",
      recipientLabel: "Grantee",
    },
    defaultClaimWindowDays: 30,
  },
  {
    id: "community-airdrop",
    name: "Community Airdrop",
    description: "Public claim campaign, allocations stay sealed until claimed.",
    icon: Megaphone,
    defaultMode: "airdrop",
    copy: {
      title: "Community airdrop",
      description: "Public claim campaign. Allocations stay sealed until claimed.",
      recipientLabel: "Recipient",
    },
    defaultClaimWindowDays: 14,
  },
];
