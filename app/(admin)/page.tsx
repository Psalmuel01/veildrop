import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { LandingDemo } from "@/components/LandingDemo";
import { PendingBanner } from "@/components/PendingBanner";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { TEMPLATES } from "@/lib/templates";

const HOW_IT_WORKS = [
  {
    title: "Upload recipients",
    body: "Drop a CSV of addresses and amounts, or add them by hand. Everything validates live.",
  },
  {
    title: "Amounts stay sealed",
    body: "Each allocation is encrypted before it ever touches the chain, pushed directly or claimed.",
  },
  {
    title: "Only they can reveal",
    body: "Recipients connect their wallet and decrypt their own allocation. No one else ever can.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden px-5 pb-20 pt-20 text-center sm:px-8 sm:pt-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-600/45 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] opacity-[0.35] [background-image:radial-gradient(circle_at_1px_1px,rgba(234,246,247,0.1)_1px,transparent_0)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black_40%,transparent_100%)]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-16 left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display text-[13rem] font-bold leading-none tracking-tighter text-ink-900/[0.035] sm:text-[18rem]"
        >
          VEILDROP
        </span>

        <div className="relative mx-auto max-w-5xl">
          {/*
            Pending check is stubbed today (always empty) and runs silently
            in the background. Once GET /api/recipients/pending exists, this
            banner will surface real pending claims without changing layout.
          */}
          <PendingBanner />

          <div className="flex justify-center">
            <Eyebrow>Sepolia testnet</Eyebrow>
          </div>
          <h1 className="mx-auto mt-5 max-w-3xl text-balance font-display text-5xl font-bold leading-[1.03] tracking-tight text-ink-900 sm:text-7xl">
            Every unlock is public. Yours doesn&apos;t have to be
            <span className="text-accent-600">.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-ink-500">
            Distribute payroll, grants, and investor allocations on-chain with the amount encrypted
            end to end, visible only to the recipient it belongs to.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/distribute">
              <Button size="lg">
                Start distributing
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button size="lg" variant="secondary">
                See docs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Live demo of the reveal mechanic */}
      <section className="relative mx-auto max-w-3xl px-5 pb-24 sm:px-8">
        <div className="rounded-3xl border border-ink-900/[0.07] bg-paper-50 px-8 py-14">
          <p className="mb-8 text-center text-sm font-medium text-ink-500">
            This is what a recipient sees, try it
          </p>
          <LandingDemo />
        </div>
      </section>

      {/* The problem */}
      <section className="relative overflow-hidden border-y border-ink-900/[0.05] bg-paper-50 py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-accent-600/20 blur-[100px]"
        />
        <div className="relative mx-auto max-w-4xl px-5 sm:px-8">
          <Eyebrow>The problem</Eyebrow>
          <p className="mt-5 text-balance font-display text-3xl font-bold leading-snug text-ink-900 sm:text-4xl">
            Across 5,000+ token unlock events, prices dropped{" "}
            <span className="text-accent-600">7 to 15 percent</span> within days of unlocks exceeding
            1 percent of circulating supply.
          </p>
          <p className="mt-6 max-w-2xl text-ink-500">
            Every distribution on a public blockchain is visible to every trader in real time.
            When a large allocation lands, algorithms front run it before it settles. Confidential
            distribution keeps the transfer verifiable on-chain, but the amount unreadable to
            anyone but the recipient.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-4xl px-5 py-24 sm:px-8">
        <Eyebrow className="justify-center">How it works</Eyebrow>
        <h2 className="mt-4 text-center font-display text-3xl font-bold text-ink-900 sm:text-4xl">
          Three steps to sealed.
        </h2>
        <div className="mt-14 flex flex-col">
          {HOW_IT_WORKS.map((step, i) => (
            <div
              key={step.title}
              className="flex items-start gap-6 border-t border-ink-900/[0.05] py-7 first:border-t-0 sm:gap-10"
            >
              <span className="font-display text-4xl font-bold text-ink-900/15 sm:text-5xl">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-ink-900 sm:text-xl">{step.title}</h3>
                <p className="mt-1.5 max-w-lg text-sm text-ink-500 sm:text-base">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="mx-auto max-w-5xl px-5 pb-28 sm:px-8">
        <Eyebrow className="justify-center">Use cases</Eyebrow>
        <h2 className="mt-4 text-center font-display text-3xl font-bold text-ink-900 sm:text-4xl">
          Built for how you distribute.
        </h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((template) => (
            <Link
              key={template.id}
              href={`/distribute?template=${template.id}`}
              className="group flex flex-col gap-3 rounded-2xl border border-ink-900/[0.07] bg-paper-50 p-6 transition-all hover:-translate-y-0.5 hover:border-accent-600/40 hover:shadow-[0_12px_30px_-12px_rgba(0,0,0,0.4)]"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-ink-900/5 text-ink-700 group-hover:bg-accent-100 group-hover:text-accent-600">
                <template.icon className="size-5" />
              </div>
              <h3 className="font-display text-base font-bold text-ink-900">{template.name}</h3>
              <p className="text-sm text-ink-500">{template.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative overflow-hidden border-t border-ink-900/[0.05] py-20 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-600/10 blur-[100px]"
        />
        <div className="relative mx-auto max-w-2xl px-5 sm:px-8">
          <Eyebrow className="justify-center">Get started</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-bold text-ink-900 sm:text-4xl">
            Distribute in the open. Keep the numbers sealed.
          </h2>
          <div className="mt-8 flex justify-center">
            <Link href="/distribute">
              <Button size="lg">
                Start distributing
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-ink-900/[0.05] py-14">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 sm:flex-row sm:px-8">
          <div className="flex items-center gap-0.5">
            <span className="font-display text-xl font-bold text-ink-900">VeilDrop</span>
            <span className="text-xl font-bold text-accent-600">.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-ink-500">
            <span>Confidential distribution on Sepolia testnet</span>
            <Link href="/docs" className="hover:text-ink-900">
              Docs
            </Link>
            <Link href="/faucet" className="flex items-center gap-1 hover:text-ink-900">
              Faucet
              <ArrowUpRight className="size-3" />
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
