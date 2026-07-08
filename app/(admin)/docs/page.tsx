import Link from "next/link";
import type { Metadata } from "next";
import { Send, Gift, Lock, KeyRound, AlertTriangle, ArrowUpRight } from "lucide-react";
import { EncryptedBadge } from "@/components/EncryptedBadge";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Docs, VeilDrop",
  description: "How confidential distribution works, Disperse vs Airdrop, and how to use VeilDrop.",
};

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "how-it-works", label: "How it works" },
  { id: "modes", label: "Disperse vs Airdrop" },
  { id: "creating", label: "Creating a distribution" },
  { id: "claiming", label: "Claiming an allocation" },
  { id: "tokens", label: "Supported tokens" },
  { id: "faq", label: "FAQ" },
];

const VEIL_TOKEN_ADDRESS = "0x1c20CeC11BbfDB19f88450569Ed7a98A7a670A42";
const VEIL_TOKEN_SOURCE_URL = "https://github.com/Psalmuel01/veildrop/blob/main/contracts/contracts/VeilToken.sol";
const VEIL_TOKEN_ETHERSCAN_URL = `https://sepolia.etherscan.io/address/${VEIL_TOKEN_ADDRESS}`;

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-ink-900/[0.05] py-14 first:pt-0 last:border-0">
      <h2 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">{title}</h2>
      <div className="mt-5 flex flex-col gap-4 text-[15px] leading-relaxed text-ink-700">{children}</div>
    </section>
  );
}

export default function DocsPage() {
  return (
    <main className="mx-auto flex max-w-6xl gap-12 px-5 py-16 sm:px-8">
      <nav className="sticky top-24 hidden h-fit w-48 shrink-0 flex-col gap-1 lg:flex">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-full px-3.5 py-1.5 text-sm text-ink-500 hover:bg-ink-900/5 hover:text-ink-900"
          >
            {s.label}
          </a>
        ))}
        <Link
          href="/faucet"
          className="mt-4 flex items-center gap-1 rounded-full border border-ink-900/[0.06] px-3.5 py-1.5 text-sm font-medium text-accent-600 hover:border-accent-600/40"
        >
          Get testnet tokens
          <ArrowUpRight className="size-3.5" />
        </Link>
      </nav>

      <div className="min-w-0 flex-1">
        <Eyebrow className="mb-4">Documentation</Eyebrow>
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink-900">
          How VeilDrop works<span className="text-accent-600">.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-ink-500">
          Everything you need to distribute tokens confidentially, or claim an allocation someone
          sent you. No prior crypto or FHE knowledge required.
        </p>

        <Section id="overview" title="Overview">
          <p>
            VeilDrop distributes ERC-7984 confidential tokens. Recipient addresses are public like
            any normal transfer, but the <em>amount</em> each address receives is encrypted end to
            end using Fully Homomorphic Encryption (FHE). Nobody but the recipient can ever see how
            much they were sent, not other recipients, not block explorers, not VeilDrop itself.
          </p>
          <p>
            This matters because public unlocks and distributions get front run. Across 5,000+
            tracked token unlock events, prices dropped 7 to 15 percent within days of an unlock
            exceeding 1 percent of circulating supply, as traders position against the visible
            allocation before it settles. Encrypting the amount removes that signal entirely while
            keeping the transfer itself fully verifiable on-chain.
          </p>
          <p className="text-sm text-ink-500">
            VeilDrop is a frontend for the{" "}
            <a
              href="https://docs.tokenops.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-600 hover:underline"
            >
              TokenOps SDK
            </a>{" "}
            and is built on{" "}
            <a
              href="https://www.zama.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-600 hover:underline"
            >
              Zama&apos;s
            </a>{" "}
            FHE protocol. All contracts are pre-deployed and audited by OpenZeppelin, this app only
            talks to them.
          </p>
        </Section>

        <Section id="how-it-works" title="How it works">
          <p>
            Every amount is encrypted client-side, in your browser, before it ever leaves your
            device. The plaintext number never touches the network. On-chain, the smart contract
            only ever operates on ciphertext: it can add, subtract, and compare encrypted balances
            without decrypting them, using FHE.
          </p>
          <p>
            Reading a balance works the same way everywhere in this app. You&apos;ll see a masked
            placeholder like this:
          </p>
          <div className="py-2">
            <EncryptedBadge />
          </div>
          <p>
            Until you click <strong className="text-ink-900">Decrypt</strong>. That does two
            things: a one-time wallet signature authorizing your own key to decrypt values on that
            contract (free, no gas), then a decrypt request scoped to only the ciphertexts you hold
            access to. Nobody else&apos;s signature can unlock your amount, and yours can&apos;t
            unlock anyone else&apos;s.
          </p>
        </Section>

        <Section id="modes" title="Disperse vs Airdrop">
          <p>VeilDrop ships two distribution mechanisms. The wizard picks a sensible default based on your use case, but you can override it under &quot;Advanced&quot; in step 1.</p>

          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-ink-900/[0.06] p-5">
              <div className="flex items-center gap-2 text-ink-900">
                <Send className="size-4 text-accent-600" />
                <h3 className="font-display text-lg font-semibold">Disperse</h3>
              </div>
              <p className="mt-2 text-sm">
                A push model. You send everything in a single transaction, tokens land directly in
                each recipient&apos;s wallet. Recipients do nothing to receive them.
              </p>
              <ul className="mt-3 flex flex-col gap-1.5 text-sm text-ink-500">
                <li>+ One transaction, any list size</li>
                <li>+ Nothing required from recipients</li>
                <li>− You (the sender) pay all the gas</li>
                <li>− One time wallet registration before first use</li>
              </ul>
            </div>
            <div className="rounded-xl border border-ink-900/[0.06] p-5">
              <div className="flex items-center gap-2 text-ink-900">
                <Gift className="size-4 text-accent-600" />
                <h3 className="font-display text-lg font-semibold">Airdrop</h3>
              </div>
              <p className="mt-2 text-sm">
                A claim model. You fund a pool and authorize each recipient&apos;s allocation,
                they claim on their own schedule via a link, within a claim window you set.
              </p>
              <ul className="mt-3 flex flex-col gap-1.5 text-sm text-ink-500">
                <li>+ Recipients pay their own claim gas</li>
                <li>+ Good for public and opt-in campaigns</li>
                <li>− One wallet signature per recipient, upfront</li>
                <li>− Recipients must actively claim</li>
              </ul>
            </div>
          </div>
          <p className="text-sm text-ink-500">
            Rule of thumb: for large recipient counts, Disperse is the better default. It&apos;s
            one transaction regardless of list size. Airdrop&apos;s per-recipient signing makes more
            sense for smaller or genuinely opt-in distributions.
          </p>
        </Section>

        <Section id="creating" title="Creating a distribution">
          <ol className="flex flex-col gap-4">
            {[
              ["Pick a use case", "Payroll, DAO rewards, investor distribution, grants, or community airdrop. Each preconfigures a sensible mode and copy."],
              ["Configure", "Name the distribution and confirm the token. For Airdrop, also set the claim window."],
              ["Add recipients", "Drag in a CSV of address,amount rows, or add them by hand. Invalid addresses, duplicates, and bad amounts are flagged live."],
              ["Review and execute", "A checklist confirms registration, approvals, and balance before the button enables. Nothing executes until every check is green."],
              ["Done", "Get your transaction hash, or for Airdrop, a claim link per recipient to share however you like."],
            ].map(([title, body], i) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-100 font-mono text-xs font-semibold text-accent-600">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-ink-900">{title}</p>
                  <p className="text-sm">{body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="text-sm text-ink-500">
            Need test tokens first? Head to the{" "}
            <Link href="/faucet" className="text-accent-600 hover:underline">
              faucet
            </Link>
            . Minting CTTT there is open and instant on Sepolia.
          </p>
        </Section>

        <Section id="claiming" title="Claiming an allocation">
          <p>If someone sent you a VeilDrop claim link, here&apos;s the whole flow:</p>
          <ol className="flex flex-col gap-4">
            {[
              ["Open the link", "It works on its own. No account, no prior connection to VeilDrop needed."],
              ["Connect your wallet", "Must be the exact address the link was sent to. VeilDrop tells you clearly if you've connected the wrong one."],
              ["Decrypt", "One free wallet signature reveals your amount, with a short animation as it resolves."],
              ["Claim", "One transaction (you pay the gas) sends the tokens to your wallet."],
            ].map(([title, body], i) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-100 font-mono text-xs font-semibold text-accent-600">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-ink-900">{title}</p>
                  <p className="text-sm">{body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="flex items-start gap-2 rounded-lg border border-ink-900/[0.06] bg-paper-50 p-4 text-sm">
            <Lock className="mt-0.5 size-4 shrink-0 text-accent-600" />
            Decrypting only reveals the amount to you, in your browser. It&apos;s never sent anywhere
            readable by VeilDrop or anyone else.
          </p>
        </Section>

        <Section id="tokens" title="Supported tokens">
          <p>
            VeilDrop supports two Sepolia confidential test tokens. The primary branded option is
            <strong className="text-ink-900"> VeilDrop Confidential Token</strong>, symbol{" "}
            <strong className="text-ink-900">vCTT</strong>. It is an ERC-7984 confidential token
            deployed from this repository for the VeilDrop project.
          </p>
          <p>
            TokenOps&apos; <strong className="text-ink-900">CTTT</strong> remains supported as a
            fallback for general testing, especially for users already familiar with the TokenOps
            ecosystem. Both tokens work with the same Disperse and Airdrop flows because the SDK
            accepts any compatible ERC-7984 token address.
          </p>
          <div className="grid gap-3 rounded-xl border border-ink-900/[0.06] bg-paper-50 p-4 text-sm sm:grid-cols-2">
            <a
              href={VEIL_TOKEN_SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 rounded-lg border border-ink-900/[0.06] px-3 py-2 text-accent-600 hover:border-accent-600/40"
            >
              <span>View VeilToken.sol</span>
              <ArrowUpRight className="size-3.5" />
            </a>
            <a
              href={VEIL_TOKEN_ETHERSCAN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 rounded-lg border border-ink-900/[0.06] px-3 py-2 text-accent-600 hover:border-accent-600/40"
            >
              <span>View vCTT on Sepolia Etherscan</span>
              <ArrowUpRight className="size-3.5" />
            </a>
          </div>
          <p className="text-sm text-ink-500">
            vCTT demonstrates full smart contract ownership for VeilDrop. CTTT stays available as a
            familiar TokenOps test token. Keeping both options makes the demo useful for reviewers
            and for anyone testing against the broader TokenOps ecosystem.
          </p>
        </Section>

        <Section id="faq" title="FAQ">
          <div className="flex flex-col gap-5">
            {[
              ["Is this on mainnet?", "No. VeilDrop currently runs on Ethereum Sepolia testnet only. The faucet, and every distribution, use test tokens with no real value."],
              ["Where do I get the token?", "CTTT (the confidential test token) is minted for free from the faucet. There's no purchase or bridging step."],
              ["What's TTT for?", "TTT is the plain ERC-20 backing CTTT under the hood. You won't need it directly in this app, CTTT mints are already fully backed."],
              ["Can VeilDrop see my amount?", "No. Amounts are encrypted in your browser before submission and only decryptable by a wallet signature from the holder. There's no backend that ever sees plaintext values."],
              ["Why did I get asked to sign or approve something before I could send?", "Registration and operator approval are one time, per wallet prerequisites the underlying contracts require before they can move your confidential balance. After the first time, later distributions skip straight to execution."],
            ].map(([q, a]) => (
              <div key={q}>
                <p className="font-medium text-ink-900">{q}</p>
                <p className="mt-1 text-sm">{a}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 flex items-start gap-2 rounded-lg border border-error-600/25 bg-error-100 p-4 text-sm text-ink-900">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-error-600" />
            Testnet software, not audited for production use with real funds. Use at your own risk.
          </p>
          <p className="mt-4 flex items-center gap-2 text-sm text-ink-500">
            <KeyRound className="size-4" />
            Ready to try it? <Link href="/distribute" className="text-accent-600 hover:underline">Start distributing</Link> or <Link href="/faucet" className="text-accent-600 hover:underline">get test tokens</Link>.
          </p>
        </Section>
      </div>
    </main>
  );
}
