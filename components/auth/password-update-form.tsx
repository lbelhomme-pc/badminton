"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PasswordUpdateFormProps {
  title?: string;
  intro?: string;
  compact?: boolean;
}

export function PasswordUpdateForm({
  title = "Choisir un nouveau mot de passe",
  intro = "Saisis un nouveau mot de passe pour sécuriser ton compte adhérent.",
  compact = false
}: PasswordUpdateFormProps) {
  const { configured, isAuthenticated, isPasswordRecovery, passwordRecoveryError, updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, setPending] = useState(false);
  const canUpdatePassword = configured && (isAuthenticated || isPasswordRecovery);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOk(false);

    if (password.length < 8) {
      setMessage("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setMessage(null);
    setPending(true);
    try {
      const result = await updatePassword(password);
      setMessage(result.message);
      setOk(result.ok);

      if (result.ok) {
        setPassword("");
        setConfirmPassword("");
      }
    } catch {
      setMessage("La mise à jour n'a pas pu aboutir. Réessaie ou redemande un lien de mot de passe oublié.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className={compact ? "p-5" : "mx-auto max-w-xl p-6"}>
      <h2 className={compact ? "text-xl font-black text-court-900" : "text-3xl font-black text-court-900"}>{title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink-500">{intro}</p>

      {!configured ? (
        <p className="mt-4 rounded-lg bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700">
          Le changement de mot de passe n’est pas encore disponible. Réessaie plus tard ou contacte le club.
        </p>
      ) : null}

      {!canUpdatePassword ? (
        <p className="mt-4 rounded-lg bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700">
          {passwordRecoveryError ?? "Connecte-toi ou redemande un lien de mot de passe oublié pour modifier ton mot de passe."}
        </p>
      ) : null}

      <form className="mt-5 grid gap-4" onSubmit={onSubmit}>
        <label className="grid gap-2 text-sm font-semibold text-court-900">
          Nouveau mot de passe
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 rounded-lg border border-court-200 bg-court-50 px-3 outline-none focus:border-court-500 focus:ring-2 focus:ring-court-500/20"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-court-900">
          Confirmer le mot de passe
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="h-11 rounded-lg border border-court-200 bg-court-50 px-3 outline-none focus:border-court-500 focus:ring-2 focus:ring-court-500/20"
          />
        </label>

        {message ? (
          <p className={`rounded-lg px-3 py-2 text-sm font-semibold ${ok ? "bg-court-100 text-court-900" : "bg-orange-50 text-orange-700"}`}>
            {message}
          </p>
        ) : null}

        <Button type="submit" disabled={pending || !canUpdatePassword}>
          {pending ? "Mise à jour..." : "Mettre à jour le mot de passe"}
        </Button>
      </form>

      {ok ? (
        <Link href="/espace-adherent" className="mt-4 inline-flex text-sm font-black text-court-600 hover:text-court-900">
          Retour à mon espace
        </Link>
      ) : null}
    </Card>
  );
}
