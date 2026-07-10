"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { usePendingRecipients } from "@/lib/hooks/usePendingRecipients";

export function PendingBanner() {
  const { data: pending } = usePendingRecipients();

  if (!pending || pending.length === 0) return null;

  return (
    <Link href="/received" className="block">
      <Card className="border-accent-600/25 bg-accent-100/30 transition-colors hover:border-accent-600/50">
        <CardContent className="flex items-center gap-4 py-5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-600/15 text-accent-600">
            <Sparkles className="size-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-ink-900">
              {pending.length} pending distribution{pending.length !== 1 ? "s" : ""} waiting
            </p>
            <p className="mt-0.5 text-sm text-ink-500">View and claim what&apos;s been sent to you.</p>
          </div>
          <ArrowRight className="size-4 shrink-0 text-accent-600" />
        </CardContent>
      </Card>
    </Link>
  );
}
