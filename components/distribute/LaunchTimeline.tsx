"use client";

import { AlertCircle, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export type LaunchStepStatus = "idle" | "pending" | "complete" | "failed";

export interface LaunchStep {
  id: string;
  label: string;
  detail?: string;
  status: LaunchStepStatus;
}

const statusText: Record<LaunchStepStatus, string> = {
  idle: "Waiting",
  pending: "In progress",
  complete: "Complete",
  failed: "Needs attention",
};

function StepIcon({ status }: { status: LaunchStepStatus }) {
  if (status === "pending") return <Loader2 className="size-4 animate-spin text-accent-600" />;
  if (status === "complete") return <CheckCircle2 className="size-4 text-success-600" />;
  if (status === "failed") return <AlertCircle className="size-4 text-error-600" />;
  return <Circle className="size-4 text-ink-300" />;
}

export function LaunchTimeline({ steps }: { steps: LaunchStep[] }) {
  return (
    <div className="rounded-xl border border-ink-900/[0.06] bg-paper-50 px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-ink-900">Launch progress</p>
        <p className="text-xs text-ink-500">{steps.filter((step) => step.status === "complete").length}/{steps.length}</p>
      </div>
      <div className="flex flex-col">
        {steps.map((step) => (
          <div key={step.id} className="flex items-start justify-between gap-4 border-t border-ink-900/[0.04] py-2.5 first:border-t-0">
            <div className="flex min-w-0 items-start gap-2.5">
              <StepIcon status={step.status} />
              <div className="min-w-0">
                <p className="text-sm text-ink-900">{step.label}</p>
                {step.detail && <p className="mt-0.5 text-xs text-ink-500">{step.detail}</p>}
              </div>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                step.status === "complete" && "bg-success-100 text-success-700",
                step.status === "pending" && "bg-accent-100 text-accent-600",
                step.status === "failed" && "bg-error-100 text-error-600",
                step.status === "idle" && "bg-ink-900/5 text-ink-500",
              )}
            >
              {statusText[step.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LaunchErrorPanel({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-error-600/25 bg-error-100/40 px-4 py-3">
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-error-600" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink-900">{title}</p>
          <p className="mt-1 break-words text-xs text-ink-500">{message}</p>
        </div>
        {onRetry && (
          <button onClick={onRetry} className="shrink-0 text-xs font-medium text-error-600 hover:text-error-700">
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
