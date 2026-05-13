import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-court-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-soft",
        className
      )}
      {...props}
    />
  );
}
