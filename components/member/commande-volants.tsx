"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createCommandeVolants, fetchVolants, type VolantRow } from "@/services/supabase-data.service";

export function CommandeVolants() {
  return (
    <ProtectedRoute>
      <CommandeVolantsContent />
    </ProtectedRoute>
  );
}

function CommandeVolantsContent() {
  const { user } = useAuth();
  const [volants, setVolants] = useState<VolantRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchVolants().then((result) => {
      setVolants(result.data.filter((volant) => volant.actif));
      if (result.error) setMessage(result.error);
    });
  }, []);

  async function order(volant: VolantRow) {
    if (!user) return;
    const result = await createCommandeVolants(user.id, volant, 1);
    setMessage(result.message);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black text-court-900">Commander des volants</h1>
      <p className="mt-3 text-ink-500">Commande un tube et règle auprès du responsable volants à la salle.</p>
      {message ? <p className="mt-6 rounded-lg bg-court-100 px-4 py-3 text-sm font-semibold text-court-900">{message}</p> : null}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {volants.map((volant) => (
          <Card key={volant.id} className="p-5">
            <p className="text-sm font-semibold text-court-600">{volant.type}</p>
            <h2 className="mt-2 text-xl font-black text-court-900">{volant.marque} {volant.modele}</h2>
            <p className="mt-2 text-sm text-ink-500">Stock : {volant.stock}</p>
            <p className="mt-3 text-2xl font-black text-court-900">{Number(volant.prix).toFixed(2)} €</p>
            <Button className="mt-5 w-full" onClick={() => order(volant)}>
              Commander un tube
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
