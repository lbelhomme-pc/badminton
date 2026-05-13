"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-danger">Erreur</p>
      <h1 className="mt-3 text-3xl font-black text-court-900">Une erreur est survenue</h1>
      <p className="mt-3 text-ink-500">Rechargez la page ou réessayez dans quelques instants.</p>
      <Button className="mt-6" onClick={reset}>Recharger</Button>
    </div>
  );
}
