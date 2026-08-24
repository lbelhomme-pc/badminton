"use client";

import { useEffect, useState } from "react";
import { Check, MapPin, PackageCheck, ShieldCheck, ShoppingBag } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { HelloAssoVolantsWidget } from "@/components/member/helloasso-volants-widget";
import { Card } from "@/components/ui/card";
import { fetchVolants, type VolantRow } from "@/services/supabase-data.service";

export function CommandeVolants() {
  return (
    <ProtectedRoute>
      <CommandeVolantsContent />
    </ProtectedRoute>
  );
}

function CommandeVolantsContent() {
  const [volants, setVolants] = useState<VolantRow[]>([]);
  const [stockError, setStockError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadStock() {
      const result = await fetchVolants();
      if (!active) return;
      setVolants(result.data.filter((volant) => volant.actif));
      setStockError(result.error);
    }

    void loadStock();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="pb-16">
      <section className="bg-court-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="max-w-3xl">
            <p className="font-display text-sm font-black uppercase tracking-wide text-court-300">Boutique adhérent</p>
            <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">Acheter des volants</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
              Choisissez vos tubes et payez directement dans la boutique officielle HelloAsso. Le retrait s’effectue ensuite auprès du club.
            </p>
          </div>

          <div className="mt-8 grid max-w-4xl gap-3 sm:grid-cols-3">
            {[
              { icon: ShoppingBag, text: "Commande sur HelloAsso" },
              { icon: ShieldCheck, text: "Paiement sécurisé" },
              { icon: MapPin, text: "Retrait au gymnase" }
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-court-500 text-white">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="font-display text-sm font-black">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto mt-8 grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
        <section className="min-w-0" aria-labelledby="helloasso-shop-title">
          <h2 id="helloasso-shop-title" className="sr-only">Boutique HelloAsso</h2>
          <HelloAssoVolantsWidget />
        </section>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5 sm:p-6">
            <p className="font-display text-xs font-black uppercase tracking-wide text-court-600">En trois étapes</p>
            <h2 className="mt-2 text-xl font-black text-court-900">Comment ça marche ?</h2>
            <ol className="mt-5 space-y-5">
              {[
                ["1", "Choisissez", "Sélectionnez les tubes dans le formulaire HelloAsso."],
                ["2", "Réglez", "Finalisez le paiement sécurisé directement sur HelloAsso."],
                ["3", "Récupérez", "Présentez votre confirmation au responsable du club."]
              ].map(([number, title, description]) => (
                <li key={number} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-court-900 font-display text-sm font-black text-white">
                    {number}
                  </span>
                  <div>
                    <p className="font-black text-court-900">{title}</p>
                    <p className="mt-1 text-sm leading-5 text-ink-500">{description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-court-100 bg-court-50 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-court-700 shadow-sm">
                  <PackageCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-display text-xs font-black uppercase tracking-wide text-court-600">Disponibilité</p>
                  <h2 className="text-lg font-black text-court-900">Stock indicatif</h2>
                </div>
              </div>
            </div>

            <div className="divide-y divide-court-100 px-5">
              {volants.map((volant) => {
                const available = volant.disponibilite !== "indisponible" && volant.stock > 0;
                return (
                  <div key={volant.id} className="py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-court-900">{volant.marque} {volant.modele}</p>
                        <p className="mt-1 text-xs text-ink-500">{volant.type}</p>
                      </div>
                      <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${available ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                        {available ? <Check className="h-3 w-3" aria-hidden="true" /> : null}
                        {available ? `${volant.stock} en stock` : "Indisponible"}
                      </span>
                    </div>
                  </div>
                );
              })}

              {!stockError && volants.length === 0 ? (
                <p className="py-5 text-sm leading-6 text-ink-500">Le stock n’est pas renseigné pour le moment.</p>
              ) : null}
              {stockError ? <p className="py-5 text-sm leading-6 text-red-700">Le stock ne peut pas être affiché actuellement.</p> : null}
            </div>

            <p className="border-t border-court-100 bg-amber-50 px-5 py-3 text-xs leading-5 text-amber-900">
              Le stock est donné à titre indicatif et n’est pas encore synchronisé automatiquement avec les ventes HelloAsso.
            </p>
          </Card>
        </aside>
      </div>
    </main>
  );
}
