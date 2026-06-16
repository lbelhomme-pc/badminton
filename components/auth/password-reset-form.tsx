"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function PasswordResetForm() {
  const { resetPassword, configured } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const result = await resetPassword(email);
    setMessage(result.message);
    setPending(false);
  }

  return (
    <Card className="mx-auto max-w-xl p-6">
      <h1 className="text-3xl font-black text-court-900">Mot de passe oublié</h1>
      <p className="mt-2 text-sm leading-6 text-ink-500">
        Indique ton email. Si un compte existe, un lien de réinitialisation sera envoyé.
      </p>
      <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
        <label className="grid gap-2 text-sm font-semibold text-court-900">
          Email
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 rounded-lg border border-court-200 bg-court-50 px-3 outline-none focus:border-court-500 focus:ring-2 focus:ring-court-500/20"
          />
        </label>
        {message ? (
          <p role="status" aria-live="polite" className="rounded-lg bg-court-100 px-3 py-2 text-sm font-semibold text-court-900">
            {message}
          </p>
        ) : null}
        <Button type="submit" disabled={pending || !configured}>
          {pending ? "Envoi..." : "Envoyer le lien"}
        </Button>
      </form>
    </Card>
  );
}
