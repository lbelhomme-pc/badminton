"use client";

import { useEffect, useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { shuttleOrderStatusLabel } from "@/lib/status-labels";
import {
  createCommandeVolants,
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
  const { user } = useAuth();
  const [volants, setVolants] = useState<VolantRow[]>([]);
  const [orders, setOrders] = useState<ShuttleOrderMemberRow[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [message, setMessage] = useState<{ tone: "success" | "error" | "info"; text: string } | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);

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
    load();
  }, []);

  function maxQuantity(volant: VolantRow) {
    return Math.max(0, Math.floor(Number(volant.stock) || 0));
  }

  function quantityFor(volant: VolantRow) {
    const max = maxQuantity(volant);
    if (max <= 0) return 0;

    return Math.min(Math.max(quantities[volant.id] ?? 1, 1), max);
  }

  function setQuantity(volant: VolantRow, quantity: number) {
    const max = maxQuantity(volant);
    if (max <= 0) {
      setQuantities((current) => ({ ...current, [volant.id]: 0 }));
      return;
    }

    const nextQuantity = Math.min(Math.max(Math.floor(quantity || 1), 1), max);
    setQuantities((current) => ({ ...current, [volant.id]: nextQuantity }));
  }

  async function order(volant: VolantRow) {
    if (!user) {
      setMessage({ tone: "error", text: "Tu dois être connecté pour commander des volants." });
      return;
    }

    const quantity = quantityFor(volant);
    if (quantity <= 0) {
      setMessage({ tone: "error", text: "Ce modèle est momentanément en rupture de stock." });
      return;
    }

    if (quantity > volant.stock) {
      setMessage({ tone: "error", text: "Stock insuffisant pour cette commande." });
      return;
    }

    setPendingId(volant.id);
    const result = await createCommandeVolants(user.id, volant, quantity);
    setMessage({ tone: result.ok ? "success" : "error", text: result.message });

    try {
      if (result.ok) {
        setQuantities((current) => ({ ...current, [volant.id]: 1 }));
        await load();
      }
    } finally {
      setPendingId(null);
    }
  }

  const messageClassName = useMemo(() => {
    if (message?.tone === "success") return "border-emerald-200 bg-emerald-50 text-emerald-700";
    if (message?.tone === "error") return "border-red-200 bg-red-50 text-red-700";
    return "border-court-200 bg-court-100 text-court-900";
  }, [message?.tone]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black text-court-900">Commander des volants</h1>
      <p className="mt-3 max-w-2xl text-ink-500">
        Choisis le nombre de tubes, vérifie le total, puis règle auprès du responsable volants à la salle.
      </p>

      {message ? (
        <p className={`mt-6 rounded-lg border px-4 py-3 text-sm font-semibold ${messageClassName}`} aria-live="polite">
          {message.text}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {volants.map((volant) => {
          const quantity = quantityFor(volant);
          const total = Number(volant.prix) * quantity;
          const pending = pendingId === volant.id;
          const outOfStock = maxQuantity(volant) <= 0;

          return (
            <Card key={volant.id} className="p-5">
              <p className="text-sm font-semibold text-court-600">{volant.type}</p>
              <h2 className="mt-2 text-xl font-black text-court-900">
                {volant.marque} {volant.modele}
              </h2>
              <p className="mt-2 text-sm text-ink-500">
                {outOfStock ? "Stock épuisé" : `${volant.stock} tube${volant.stock > 1 ? "s" : ""} disponible${volant.stock > 1 ? "s" : ""}`}
              </p>
              <p className="mt-3 text-2xl font-black text-court-900">{Number(volant.prix).toFixed(2)} € / tube</p>

              <div className="mt-5 rounded-lg border border-court-200 bg-court-50 p-3">
                <label className="text-sm font-bold text-court-900" htmlFor={`quantity-${volant.id}`}>
                  Nombre de tubes
                </label>

                {outOfStock ? (
                  <p className="mt-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-ink-500">
                    Réapprovisionnement à demander au responsable volants.
                  </p>
                ) : (
                  <>
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
                        max={volant.stock}
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
                        disabled={quantity >= volant.stock}
                        onClick={() => setQuantity(volant, quantity + 1)}
                        aria-label="Augmenter la quantité"
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-ink-500">
                      Total : {total.toFixed(2)} € · maximum {volant.stock}
                    </p>
                  </>
                )}
              </div>

              <Button className="mt-5 w-full" disabled={outOfStock || pending} onClick={() => order(volant)}>
                {outOfStock ? "Stock épuisé" : pending ? "Commande..." : `Commander ${quantity} tube${quantity > 1 ? "s" : ""}`}
              </Button>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8 p-5">
        <h2 className="text-2xl font-black text-court-900">Mon historique volants</h2>
        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">Aucun achat ou commande enregistré.</p>
        ) : (
          <div className="mt-4 grid gap-3">
            {orders.map((order) => (
              <div key={order.id} className="flex flex-wrap items-start justify-between gap-3 rounded-lg bg-court-50 p-4">
                <div>
                  <p className="font-black text-court-900">
                    {order.volants?.marque} {order.volants?.modele ?? ""}
                  </p>
                  <p className="mt-1 text-sm text-ink-500">
                    {order.quantite} tube{order.quantite > 1 ? "s" : ""} · {new Date(order.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase text-court-700">
                    {shuttleOrderStatusLabel(order.statut)}
                  </span>
                  <p className="mt-2 text-sm font-semibold text-court-900">
                    {order.total != null ? `${Number(order.total).toFixed(2)} €` : "Total non renseigné"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
