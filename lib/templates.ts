import type { LucideIcon } from "lucide-react";
import { Banknote, Users, Landmark, Gift, Megaphone } from "lucide-react";

// A third mode, vesting, is planned as a future addition using the TokenOps
// SDK's fhe-vesting subpath. It will need its own wizard step for cliff
// duration and vesting period configuration, plus a recipient side schedule
// view instead of a one time claim. Not built in this pass.
export type DistributionMode = "disperse" | "airdrop";

export interface DistributionTemplate {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  defaultMode: DistributionMode;
  copy: {
    title: string;
    recipientLabel: string;
  };
}

export const TEMPLATES: DistributionTemplate[] = [
  {
    id: "payroll",
    name: "Payroll",
    description: "Recurring compensation, paid directly, amounts never public.",
    icon: Banknote,
    defaultMode: "disperse",
    copy: { title: "Payroll run", recipientLabel: "Employee" },
  },
  {
    id: "dao-rewards",
    name: "DAO Rewards",
    description: "Contributor rewards pushed straight to their wallet.",
    icon: Users,
    defaultMode: "disperse",
    copy: { title: "Contributor rewards", recipientLabel: "Contributor" },
  },
  {
    id: "investor",
    name: "Investor Distribution",
    description: "Allocations delivered privately, no front running your unlock.",
    icon: Landmark,
    defaultMode: "disperse",
    copy: { title: "Investor distribution", recipientLabel: "Investor" },
  },
  {
    id: "grants",
    name: "Grants",
    description: "Program grants recipients claim on their own schedule.",
    icon: Gift,
    defaultMode: "airdrop",
    copy: { title: "Grant round", recipientLabel: "Grantee" },
  },
  {
    id: "community-airdrop",
    name: "Community Airdrop",
    description: "Public claim campaign, allocations stay sealed until claimed.",
    icon: Megaphone,
    defaultMode: "airdrop",
    copy: { title: "Community airdrop", recipientLabel: "Recipient" },
  },
];
