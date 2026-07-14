"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchVolants, type VolantRow } from "@/services/supabase-data.service";

const fallbackVolants: VolantRow[] = [
  {
    id: -1,
    marque: "RSL",
    modele: "Rouges",
    type: "plume",
    prix: 25,
    stock: 0,
    actif: true
  },
  {
    id: -2,
    marque: "Forza",
    modele: "Hybride",
    type: "hybride",
    prix: 16,
    stock: 0,
    actif: true
  }
];

function stockLabel(volant: VolantRow) {
  if (volant.id < 0) {
    return "Disponibilite et stock a confirmer par le responsable volants.";
  }

  return volant.stock > 0
    ? `${volant.stock} tube${volant.stock > 1 ? "s" : ""} actuellement disponible${volant.stock > 1 ? "s" : ""}.`
    : "Stock momentanement epuise.";
}

export function VolantsPublicList() {
  const [volants, setVolants] = useState<VolantRow[]>(fallbackVolants);
  const [message, setMessage] = useState<string | null>(null);
  const [fallbackMode, setFallbackMode] = useState(true);

  useEffect(() => {
    fetchVolants().then((result) => {
      const activeVolants = result.data.filter((volant) => volant.actif);

      if (activeVolants.length > 0) {
        setVolants(activeVolants);
        setMessage(null);
        setFallbackMode(false);
      } else if (result.error && result.error !== "Configuration Supabase manquante.") {
        setMessage(result.error);
      }
    });
  }, []);

  return (
    <div className="space-y-6">
      {message ? <p className="rounded-lg bg-yellow-50 px-4 py-3 text-sm font-semibold text-yellow-800">{message}</p> : null}
      {fallbackMode ? (
        <p className="rounded-lg bg-yellow-50 px-4 py-3 text-sm font-semibold text-yellow-800">
          Prix issus du compte rendu du bureau : RSL rouges a 25 euros et Forza Hybride a 16 euros. Le stock reste a confirmer.
        </p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-3">
        {volants.map((volant) => (
          <Card key={volant.id} className="p-5">
            <PackageCheck className="h-6 w-6 text-court-500" aria-hidden="true" />
            <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-court-600">{volant.type}</p>
            <h2 className="mt-2 text-xl font-black text-court-900">
              {volant.marque} {volant.modele}
            </h2>
            <p className="mt-3 text-3xl font-black text-court-900">{Number(volant.prix).toFixed(2)} euros</p>
            <p className="mt-2 text-sm leading-6 text-ink-500">{stockLabel(volant)}</p>
          </Card>
        ))}
      </div>
      <Card className="p-5">
        <h2 className="text-2xl font-black text-court-900">Commander ou retirer des volants</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-ink-500">
          Les prix et stocks affiches viennent de l'administration du club lorsqu'elle est configuree. Connecte-toi pour reserver, ou demande au responsable
          volants d'enregistrer une vente rapide si tu achetes directement sur place.
        </p>
        <Link href="/commande-volants">
          <Button className="mt-5">Commander des volants</Button>
        </Link>
      </Card>
    </div>
  );
}
