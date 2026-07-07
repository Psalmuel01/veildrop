import Link from "next/link";
import { ArrowRight, Upload, EyeOff, KeyRound } from "lucide-react";
import { Header } from "@/components/Header";
import { LandingDemo } from "@/components/LandingDemo";
import { TEMPLATES } from "@/lib/templates";

export default function Home() {
  return (
    <div className="min-h-screen bg-paper-100">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden px-5 pb-20 pt-20 text-center sm:px-8 sm:pt-28">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-12rem] h-[36rem] w-[56rem] -translate-x-1/2 rounded-full bg-accent-600/[0.12] blur-[110px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] opacity-[0.35] [background-image:radial-gradient(circle_at_1px_1px,rgba(234,246,247,0.1)_1px,transparent_0)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black_40%,transparent_100%)]"
        />
        <div className="relative mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-600">
            Confidential token distribution
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl text-balance font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink-900 sm:text-6xl">
            Every unlock is public. Yours doesn&apos;t have to be.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-ink-700">
            Distribute payroll, grants, and investor allocations on-chain with the amount encrypted
            end to end — visible only to the recipient it belongs to.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/distribute"
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-ink-900 px-6 text-sm font-medium text-paper-50 transition-colors hover:bg-accent-700"
            >
              Create a distribution
              <ArrowRight className="size-4" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-ink-900/20 px-6 text-sm font-medium text-ink-900 transition-colors hover:border-ink-900/40"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* Live demo of the reveal mechanic */}
      <section className="mx-auto max-w-3xl px-5 pb-24 sm:px-8">
        <div className="rounded-3xl border border-ink-900/10 bg-paper-50 px-8 py-14">
          <p className="mb-8 text-center text-sm font-medium text-ink-500">
            This is what a recipient sees — try it
          </p>
          <LandingDemo />
        </div>
      </section>

      {/* The problem */}
      <section className="relative overflow-hidden border-y border-ink-900/8 bg-paper-50 py-20 text-ink-900">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-accent-600/20 blur-[100px]"
        />
        <div className="relative mx-auto max-w-4xl px-5 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-300">
            The problem
          </p>
          <p className="mt-5 text-balance font-display text-3xl font-medium leading-snug sm:text-4xl">
            Across 5,000+ token unlock events, prices dropped{" "}
            <span className="text-accent-300">7–15%</span> within days of unlocks exceeding 1% of
            circulating supply.
          </p>
          <p className="mt-6 max-w-2xl text-ink-500">
            Every distribution on a public blockchain is visible to every trader in real time.
            When a large allocation lands, algorithms front-run it before it settles. Confidential
            distribution keeps the transfer verifiable on-chain — but the amount unreadable to
            anyone but the recipient.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-5xl px-5 py-24 sm:px-8">
        <h2 className="text-center font-display text-3xl font-semibold text-ink-900">How it works</h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {[
            {
              icon: Upload,
              title: "Upload recipients",
              body: "Drop a CSV of addresses and amounts, or add them by hand. Everything validates live.",
            },
            {
              icon: EyeOff,
              title: "Amounts stay sealed",
              body: "Each allocation is encrypted before it ever touches the chain — pushed directly or claimed.",
            },
            {
              icon: KeyRound,
              title: "Only they can reveal",
              body: "Recipients connect their wallet and decrypt their own allocation. No one else ever can.",
            },
          ].map((step) => (
            <div key={step.title} className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <div className="flex size-11 items-center justify-center rounded-xl bg-accent-100 text-accent-700">
                <step.icon className="size-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink-900">{step.title}</h3>
              <p className="mt-1.5 text-sm text-ink-500">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="mx-auto max-w-5xl px-5 pb-28 sm:px-8">
        <h2 className="text-center font-display text-3xl font-semibold text-ink-900">
          Built for how you distribute
        </h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((template) => (
            <Link
              key={template.id}
              href={`/distribute?template=${template.id}`}
              className="group flex flex-col gap-3 rounded-2xl border border-ink-900/10 bg-paper-50 p-6 transition-all hover:-translate-y-0.5 hover:border-accent-600/40 hover:shadow-[0_12px_30px_-12px_rgba(0,0,0,0.4)]"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-ink-900/5 text-ink-700 group-hover:bg-accent-100 group-hover:text-accent-700">
                <template.icon className="size-5" />
              </div>
              <h3 className="font-display text-base font-semibold text-ink-900">{template.name}</h3>
              <p className="text-sm text-ink-500">{template.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-ink-900/8 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-ink-500 sm:flex-row sm:px-8">
          <span>VeilDrop · Confidential distribution on Sepolia testnet</span>
          <Link href="/faucet" className="hover:text-ink-900">
            Developer · Faucet
          </Link>
        </div>
      </footer>
    </div>
  );
}
