import { cn } from "@/lib/utils";

export type AdminFeedbackMessage = {
  tone: "success" | "error";
  text: string;
} | null;

export function actionFeedback(result: { ok: boolean; message: string }): AdminFeedbackMessage {
  return {
    tone: result.ok ? "success" : "error",
    text: result.ok ? `Succès : ${result.message}` : `Erreur : ${result.message}`
  };
}

export function errorFeedback(error: string | null | undefined): AdminFeedbackMessage {
  return error ? { tone: "error", text: `Erreur : ${error}` } : null;
}

export function successFeedback(text: string): AdminFeedbackMessage {
  return { tone: "success", text: `Succès : ${text}` };
}

export function AdminFeedback({ feedback, className }: { feedback: AdminFeedbackMessage; className?: string }) {
  if (!feedback) {
    return null;
  }

  return (
    <p
      role={feedback.tone === "error" ? "alert" : "status"}
      aria-live="polite"
      className={cn(
        "rounded-lg px-4 py-3 text-sm font-semibold",
        feedback.tone === "error" ? "bg-orange-50 text-orange-700" : "bg-court-100 text-court-900",
        className
      )}
    >
      {feedback.text}
    </p>
  );
}
