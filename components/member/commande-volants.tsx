"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Minus, Plus, ShieldCheck } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { HelloAssoVolantsWidget } from "@/components/member/helloasso-volants-widget";
import { buildHelloAssoProductUrl, helloAssoMissingMessage } from "@/lib/helloasso";
import { shuttleOrderStatusLabel } from "@/lib/status-labels";
import {
  fetchMyShuttleOrders,
  fetchVolants,
  type ShuttleOrderMemberRow,
  type VolantRow
} from "@/services/supabase-data.service";

export function CommandeVolants() {
  return (
    <ProtectedRoute>
      <CommandeVolantsContent />
    </ProtectedRoute>
  );
}

function CommandeVolantsContent() {
  const [volants, setVolants] = useState<VolantRow[]>([]);
  const [orders, setOrders] = useState<ShuttleOrderMemberRow[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [message, setMessage] = useState<{ tone: "success" | "error" | "info"; text: string } | null>(null);

  async function load() {
    const [result, orderResult] = await Promise.all([fetchVolants(), fetchMyShuttleOrders()]);
    setVolants(result.data.filter((volant) => volant.actif));
    setOrders(orderResult.data);

    if (result.error) {
      setMessage({ tone: "error", text: result.error });
    } else if (orderResult.error) {
      setMessage({ tone: "error", text: orderResult.error });
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function maxQuantity(volant: VolantRow) {
    return Math.max(1, Math.floor(Number(volant.limite_commande) || 4));
  }

  function quantityFor(volant: VolantRow) {
    return Math.min(Math.max(quantities[volant.id] ?? 1, 1), maxQuantity(volant));
  }

  function setQuantity(volant: VolantRow, quantity: number) {
    const nextQuantity = Math.min(Math.max(Math.floor(quantity || 1), 1), maxQuantity(volant));
    setQuantities((current) => ({ ...current, [volant.id]: nextQuantity }));
  }

  function openHelloAsso(volant: VolantRow) {
    const quantity = quantityFor(volant);
    const url = buildHelloAssoProductUrl({
      helloassoUrl: volant.helloasso_url,
      reference: volant.reference ?? volant.helloasso_item_id,
      quantity
    });

    if (!url) {
      setMessage({ tone: "error", text: helloAssoMissingMessage() });
      return;
    }

    setMessage({
      tone: "info",
      text: "Ouverture de HelloAsso. Le paiement et la confirmation se font sur la page officielle HelloAsso."
    });
    window.location.href = url;
  }

  const messageClassName = useMemo(() => {
    if (message?.tone === "success") return "border-emerald-200 bg-emerald-50 text-emerald-700";
    if (message?.tone === "error") return "border-red-200 bg-red-50 text-red-700";
    return "border-court-200 bg-court-100 text-court-900";
  }, [message?.tone]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section>
          <p className="font-display text-sm font-bold uppercase text-court-600">Boutique adhérent</p>
          <h1 className="mt-2 text-4xl font-black text-court-900">Commander des volants</h1>
          <p className="mt-3 max-w-3xl text-ink-500">
            Choisis le produit, vérifie les modalités de retrait, puis règle sur la boutique officielle HelloAsso du club. Le site CFVV ne collecte
            jamais de numéro de carte bancaire.
          </p>

          {message ? (
            <p className={`mt-6 rounded-lg border px-4 py-3 text-sm font-semibold ${messageClassName}`} aria-live="polite">
              {message.text}
            </p>
          ) : null}

          <div className="mt-6">
            <HelloAssoVolantsWidget />
          </div>

          <div className="mt-10">
            <p className="font-display text-sm font-black uppercase text-court-600">Produits proposés</p>
            <h2 className="mt-1 text-2xl font-black text-court-900">Prix, stock et modalités de retrait</h2>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {volants.map((volant) => {
              const quantity = quantityFor(volant);
              const total = Number(volant.prix) * quantity;
              const unavailable = volant.disponibilite === "indisponible" || !volant.helloasso_url;
              const helloAssoUrl = buildHelloAssoProductUrl({
                helloassoUrl: volant.helloasso_url,
                reference: volant.reference ?? volant.helloasso_item_id,
                quantity
              });

              return (
                <Card key={volant.id} className="overflow-hidden">
                  {volant.photo_url ? (
                    <div className="relative aspect-[4/3] bg-court-50">
                      <img src={volant.photo_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                    </div>
                  ) : null}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-court-600">{volant.type}</p>
                        <h2 className="mt-2 text-xl font-black text-court-900">
                          {volant.marque} {volant.modele}
                        </h2>
                        {volant.reference ? <p className="mt-1 text-xs font-semibold text-ink-500">Réf. {volant.reference}</p> : null}
                      </div>
                      <Badge variant={volant.disponibilite === "indisponible" ? "danger" : "success"}>
                        {volant.disponibilite === "indisponible" ? "Indisponible" : "Disponible"}
                      </Badge>
                    </div>

                    <p className="mt-4 text-3xl font-black text-court-900">{Number(volant.prix).toFixed(2)} €</p>
                    <p className="mt-1 text-sm text-ink-500">
                      {volant.quantite_boite ?? 12} volant{(volant.quantite_boite ?? 12) > 1 ? "s" : ""} par boîte. Stock indicatif :{" "}
                      {volant.stock} tube{volant.stock > 1 ? "s" : ""}.
                    </p>

                    <div className="mt-5 rounded-lg border border-court-200 bg-court-50 p-3">
                      <label className="text-sm font-bold text-court-900" htmlFor={`quantity-${volant.id}`}>
                        Nombre de tubes
                      </label>
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={quantity <= 1}
                          onClick={() => setQuantity(volant, quantity - 1)}
                          aria-label="Diminuer la quantité"
                        >
                          <Minus className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <input
                          id={`quantity-${volant.id}`}
                          min="1"
                          max={maxQuantity(volant)}
                          type="number"
                          inputMode="numeric"
                          value={quantity}
                          onChange={(event) => setQuantity(volant, Number(event.target.value))}
                          className="h-10 w-20 rounded-lg border border-court-200 bg-white px-3 text-center text-sm font-black text-court-900"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={quantity >= maxQuantity(volant)}
                          onClick={() => setQuantity(volant, quantity + 1)}
                          aria-label="Augmenter la quantité"
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-ink-500">
                        Total indicatif : {total.toFixed(2)} € · limite {maxQuantity(volant)} tube{maxQuantity(volant) > 1 ? "s" : ""}
                      </p>
                    </div>

                    <div className="mt-4 rounded-lg bg-white p-3 text-sm leading-6 text-ink-600 ring-1 ring-court-100">
                      <p className="font-bold text-court-900">Retrait</p>
                      <p>{volant.instructions_retrait || "Retrait auprès du responsable volants à la salle."}</p>
                    </div>

                    <Button className="mt-5 w-full" disabled={unavailable} onClick={() => openHelloAsso(volant)}>
                      {unavailable ? helloAssoMissingMessage() : "Payer sur HelloAsso"}
                      {helloAssoUrl ? <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" /> : null}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {volants.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="Aucun volant disponible"
                text="La boutique adhérent sera affichée ici dès que le bureau aura ajouté les produits et les liens HelloAsso."
              />
            </div>
          ) : null}
        </section>

        <aside className="space-y-4">
          <Card className="p-5">
            <ShieldCheck className="h-6 w-6 text-court-500" aria-hidden="true" />
            <h2 className="mt-3 text-xl font-black text-court-900">Paiement sécurisé</h2>
            <p className="mt-2 text-sm leading-6 text-ink-600">
              Le paiement est traité par HelloAsso. Le CFVV n'a pas accès à tes coordonnées bancaires et ne stocke aucune donnée de carte.
            </p>
          </Card>

          <Card className="p-5">
            <h2 className="text-xl font-black text-court-900">Historique club</h2>
            {orders.length === 0 ? (
              <p className="mt-3 text-sm text-ink-500">Aucune commande interne enregistrée.</p>
            ) : (
              <div className="mt-4 grid gap-3">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="rounded-lg bg-court-50 p-4">
                    <p className="font-black text-court-900">
                      {order.volants?.marque} {order.volants?.modele ?? ""}
                    </p>
                    <p className="mt-1 text-sm text-ink-500">
                      {order.quantite} tube{order.quantite > 1 ? "s" : ""} · {new Date(order.created_at).toLocaleDateString("fr-FR")}
                    </p>
                    <span className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-black uppercase text-court-700">
                      {shuttleOrderStatusLabel(order.statut)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
