import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface FieldFrameProps {
  children: ReactNode;
  error?: string;
  help?: string;
  id: string;
  label: string;
}

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  error?: string;
  help?: string;
  id: string;
  label: string;
}

interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  error?: string;
  help?: string;
  id: string;
  label: string;
}

function FieldFrame({ children, error, help, id, label }: FieldFrameProps) {
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <label className="grid gap-2 text-sm font-bold text-court-900" htmlFor={id}>
      {label}
      {children}
      {help ? <span id={helpId} className="text-sm font-medium leading-6 text-ink-500">{help}</span> : null}
      {error ? <span id={errorId} className="text-sm font-bold leading-6 text-red-700">{error}</span> : null}
    </label>
  );
}

export function TextField({ className, error, help, id, label, ...props }: TextFieldProps) {
  return (
    <FieldFrame id={id} label={label} help={help} error={error}>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={[help ? `${id}-help` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined}
        className={cn(
          "h-11 rounded-lg border border-court-200 bg-white px-3 text-base text-court-900 outline-none transition focus:border-court-500 focus:ring-2 focus:ring-court-500/20",
          error && "border-red-300 focus:border-red-500 focus:ring-red-500/20",
          className
        )}
        {...props}
      />
    </FieldFrame>
  );
}

export function TextAreaField({ className, error, help, id, label, ...props }: TextAreaFieldProps) {
  return (
    <FieldFrame id={id} label={label} help={help} error={error}>
      <textarea
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={[help ? `${id}-help` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined}
        className={cn(
          "min-h-28 rounded-lg border border-court-200 bg-white px-3 py-3 text-base text-court-900 outline-none transition focus:border-court-500 focus:ring-2 focus:ring-court-500/20",
          error && "border-red-300 focus:border-red-500 focus:ring-red-500/20",
          className
        )}
        {...props}
      />
    </FieldFrame>
  );
}
