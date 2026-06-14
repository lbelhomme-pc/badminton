"use client";

import { useEffect, useState } from "react";
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
  const [message, setMessage] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);

  async function load() {
    const [result, orderResult] = await Promise.all([fetchVolants(), fetchMyShuttleOrders()]);
    setVolants(result.data.filter((volant) => volant.actif));
    setOrders(orderResult.data);
    if (result.error) setMessage(result.error);
    if (orderResult.error) setMessage(orderResult.error);
  }

  useEffect(() => {
    load();
  }, []);

  function quantityFor(volant: VolantRow) {
    return Math.min(Math.max(quantities[volant.id] ?? 1, 1), Math.max(volant.stock, 1));
  }

  function setQuantity(volant: VolantRow, quantity: number) {
    const nextQuantity = Math.min(Math.max(Math.floor(quantity), 1), Math.max(volant.stock, 1));
    setQuantities((current) => ({ ...current, [volant.id]: nextQuantity }));
  }

  async function order(volant: VolantRow) {
    if (!user) return;
    if (volant.stock <= 0) {
      setMessage("Ce modèle est momentanément en rupture de stock.");
      return;
    }

    const quantity = quantityFor(volant);
    if (quantity > volant.stock) {
      setMessage("Quantité demandée supérieure au stock disponible.");
      return;
    }

    setPendingId(volant.id);
    const result = await createCommandeVolants(user.id, volant, quantity);
    setMessage(result.message);
    if (result.ok) {
      setQuantities((current) => ({ ...current, [volant.id]: 1 }));
      await load();
    }
    setPendingId(null);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black text-court-900">Commander des volants</h1>
      <p className="mt-3 text-ink-500">Commande un ou plusieurs tubes et règle auprès du responsable volants à la salle.</p>
      {message ? <p className="mt-6 rounded-lg bg-court-100 px-4 py-3 text-sm font-semibold text-court-900">{message}</p> : null}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {volants.map((volant) => {
          const quantity = quantityFor(volant);
          const total = Number(volant.prix) * quantity;
          const pending = pendingId === volant.id;

          return (
            <Card key={volant.id} className="p-5">
              <p className="text-sm font-semibold text-court-600">{volant.type}</p>
              <h2 className="mt-2 text-xl font-black text-court-900">{volant.marque} {volant.modele}</h2>
              <p className="mt-2 text-sm text-ink-500">Stock : {volant.stock}</p>
              <p className="mt-3 text-2xl font-black text-court-900">{Number(volant.prix).toFixed(2)} €</p>

              <div className="mt-5 rounded-lg border border-court-200 bg-court-50 p-3">
                <label className="text-sm font-bold text-court-900" htmlFor={`quantity-${volant.id}`}>
                  Nombre de tubes
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={volant.stock <= 0 || quantity <= 1}
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
                    disabled={volant.stock <= 0}
                    onChange={(event) => setQuantity(volant, Number(event.target.value))}
                    className="h-10 w-20 rounded-lg border border-court-200 bg-white px-3 text-center text-sm font-black text-court-900"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={volant.stock <= 0 || quantity >= volant.stock}
                    onClick={() => setQuantity(volant, quantity + 1)}
                    aria-label="Augmenter la quantité"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
                <p className="mt-2 text-sm font-semibold text-ink-500">Total : {total.toFixed(2)} €</p>
              </div>

              <Button className="mt-5 w-full" disabled={volant.stock <= 0 || pending} onClick={() => order(volant)}>
                {volant.stock <= 0 ? "Stock épuisé" : pending ? "Commande..." : `Commander ${quantity} tube${quantity > 1 ? "s" : ""}`}
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
