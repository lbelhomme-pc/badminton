import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, Loader2, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type FeedbackTone = "success" | "info" | "warning" | "error" | "loading";

interface FeedbackMessageProps {
  children: ReactNode;
  className?: string;
  tone?: FeedbackTone;
  title?: string;
}

const toneStyles: Record<FeedbackTone, string> = {
  success: "border-court-200 bg-court-50 text-court-900",
  info: "border-blue-200 bg-blue-50 text-blue-800",
  warning: "border-yellow-200 bg-yellow-50 text-yellow-800",
  error: "border-red-200 bg-red-50 text-red-700",
  loading: "border-court-200 bg-white text-ink-700"
};

const icons = {
  success: CheckCircle2,
  info: Info,
  warning: TriangleAlert,
  error: AlertCircle,
  loading: Loader2
};

export function FeedbackMessage({ children, className, tone = "info", title }: FeedbackMessageProps) {
  const Icon = icons[tone];

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      className={cn("flex gap-3 rounded-lg border px-4 py-3 text-sm leading-6", toneStyles[tone], className)}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", tone === "loading" && "animate-spin")} aria-hidden="true" />
      <div>
        {title ? <p className="font-display text-base font-bold leading-5">{title}</p> : null}
        <div className={title ? "mt-1" : undefined}>{children}</div>
      </div>
    </div>
  );
}
