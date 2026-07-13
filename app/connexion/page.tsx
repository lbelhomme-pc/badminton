import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Connexion - CFVV",
  description: "Connexion à l'espace adhérent du Club des fous du Volant Vendômois."
};

export default function ConnexionPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Espace privé</p>
        <h1 className="mt-2 text-4xl font-black text-court-900">Connexion au club</h1>
        <p className="mx-auto mt-3 max-w-2xl text-ink-500">
          Accède à tes réservations, aux informations internes et aux services adhérents.
        </p>
      </div>
      <Suspense fallback={<p className="text-center text-sm font-semibold text-ink-500">Chargement du formulaire...</p>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
