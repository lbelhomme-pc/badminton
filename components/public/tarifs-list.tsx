"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { fetchTarifs, type TarifRow } from "@/services/supabase-data.service";

type PublicTarif = Omit<TarifRow, "id"> & { id: number | string };

const demoDescription = "Donnée de démonstration à confirmer par le bureau avant publication officielle.";

const fallbackTarifs: PublicTarif[] = [
  {
    id: "enfants-loisirs",
    titre: "Licence enfants loisirs",
    description: demoDescription,
    montant: 50,
    public: "Jeunes",
    ordre: 1,
    actif: true
  },
  {
    id: "enfants-competiteurs",
    titre: "Licence enfants compétiteurs",
    description: demoDescription,
    montant: 85,
    public: "Jeunes compétiteurs",
    ordre: 2,
    actif: true
  },
  {
    id: "adultes-loisirs",
    titre: "Licence loisirs",
    description: demoDescription,
    montant: 60,
    public: "Loisirs",
    ordre: 3,
    actif: true
  },
  {
    id: "competition",
    titre: "Licence compétiteurs",
    description: demoDescription,
    montant: 95,
    public: "Compétiteurs",
    ordre: 4,
    actif: true
  },
  {
    id: "essai",
    titre: "Essai",
    description: demoDescription,
    montant: 0,
    public: "Découverte",
    ordre: 5,
    actif: true
  }
];

function formatTarif(tarif: PublicTarif) {
  if (Number(tarif.montant) > 0) {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Number(tarif.montant));
  }

  if (tarif.titre.toLowerCase().includes("essai")) {
    return "Gratuit";
  }

  return "Contacter le club";
}

export function TarifsList() {
  const [tarifs, setTarifs] = useState<PublicTarif[]>(fallbackTarifs);
  const [message, setMessage] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(true);

  useEffect(() => {
    fetchTarifs().then((result) => {
      if (result.data.length > 0) {
        setTarifs(result.data);
        setMessage(null);
        setDemoMode(false);
      } else if (result.error && result.error !== "Configuration Supabase manquante.") {
        setMessage(result.error);
      }
    });
  }, []);

  return (
    <>
      {message ? <p className="mb-5 rounded-lg bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700">{message}</p> : null}
      {demoMode ? (
        <p className="mb-5 rounded-lg bg-yellow-50 px-4 py-3 text-sm font-semibold text-yellow-800">
          Tarifs de démonstration : les montants doivent être validés par le bureau avant communication officielle.
        </p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {tarifs
          .filter((tarif) => tarif.actif)
          .sort((a, b) => a.ordre - b.ordre)
          .map((tarif) => (
            <Card key={tarif.id} className="p-5">
              <CheckCircle2 className="h-6 w-6 text-court-500" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-black text-court-900">{tarif.titre}</h2>
              <p className="mt-2 text-3xl font-black text-court-900">{formatTarif(tarif)}</p>
              {tarif.public ? <p className="mt-1 font-display text-xs font-bold uppercase text-court-600">{tarif.public}</p> : null}
              <p className="mt-3 text-sm leading-6 text-ink-600">{tarif.description}</p>
            </Card>
          ))}
      </div>
    </>
  );
}
