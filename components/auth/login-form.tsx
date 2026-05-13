"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, configured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const result = await login(email, password);
    setMessage(result.message);
    setPending(false);

    if (result.ok) {
      router.push(searchParams.get("redirect") ?? "/espace-adherent");
    }
  }

  return (
    <Card className="mx-auto max-w-xl p-6">
      <h1 className="text-3xl font-black text-court-900">Connexion</h1>
      <p className="mt-2 text-sm leading-6 text-ink-500">
        Connecte-toi pour accéder à ton espace adhérent, tes réservations et les services du club.
      </p>
      {!configured ? (
        <p className="mt-4 rounded-lg bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700">
          Configuration Supabase manquante. Renseigne `.env.local` pour activer la connexion réelle.
        </p>
      ) : null}
      <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
        <label className="grid gap-2 text-sm font-semibold text-court-900">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 rounded-lg border border-court-200 bg-court-50 px-3 outline-none focus:border-court-500 focus:ring-2 focus:ring-court-500/20"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-court-900">
          Mot de passe
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 rounded-lg border border-court-200 bg-court-50 px-3 outline-none focus:border-court-500 focus:ring-2 focus:ring-court-500/20"
          />
        </label>
        {message ? <p className="rounded-lg bg-court-100 px-3 py-2 text-sm font-semibold text-court-900">{message}</p> : null}
        <Button type="submit" disabled={pending || !configured}>
          {pending ? "Connexion..." : "Se connecter"}
        </Button>
      </form>
      <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold">
        <Link href="/creation-compte" className="text-court-600 hover:text-court-900">
          Créer un compte
        </Link>
        <Link href="/mot-de-passe-oublie" className="text-ink-500 hover:text-court-900">
          Mot de passe oublié
        </Link>
      </div>
    </Card>
  );
}
