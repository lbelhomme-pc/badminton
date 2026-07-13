import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "info";

interface BadgeProps {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  neutral: "border-court-200 bg-white text-court-900",
  success: "border-court-200 bg-court-100 text-court-900",
  warning: "border-yellow-200 bg-yellow-50 text-yellow-800",
  danger: "border-red-200 bg-red-50 text-red-700",
  info: "border-blue-200 bg-blue-50 text-blue-700"
};

export function Badge({ children, className, icon, variant = "neutral" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold leading-none",
        variants[variant],
        className
      )}
    >
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      {children}
    </span>
  );
}
