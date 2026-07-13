import type { ReactNode } from "react";
import { SearchX } from "lucide-react";

interface EmptyStateProps {
  title: string;
  text: string;
  action?: ReactNode;
}

export function EmptyState({ title, text, action }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-court-300 bg-court-50 px-6 py-10 text-center">
      <SearchX className="mx-auto h-8 w-8 text-court-600" aria-hidden="true" />
      <h3 className="mt-4 text-xl font-bold text-court-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-600">{text}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
