"use client";

import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useClub } from "@/hooks/use-club-store";
import { cn, formatEuros } from "@/lib/utils";
import type { ShuttleProduct } from "@/types/domain";

interface ShuttleShopProps {
  products: ShuttleProduct[];
}

export function ShuttleShop({ products }: ShuttleShopProps) {
  const { createShuttleOrder, orders } = useClub();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [message, setMessage] = useState<string | null>(null);

  function quantityFor(product: ShuttleProduct) {
    const max = Math.max(0, product.stockQuantity);
    if (max <= 0) return 0;
    return Math.min(Math.max(quantities[product.id] ?? 1, 1), max);
  }

  function setQuantity(product: ShuttleProduct, value: number) {
    const max = Math.max(0, product.stockQuantity);
    if (max <= 0) {
      setQuantities((current) => ({ ...current, [product.id]: 0 }));
      return;
    }

    setQuantities((current) => ({ ...current, [product.id]: Math.min(Math.max(1, value), max) }));
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        {products.map((product) => {
          const quantity = quantityFor(product);
          const lowStock = product.stockQuantity <= product.lowStockThreshold;
          const outOfStock = product.stockQuantity <= 0;
          const visualClass = {
            green: "bg-emerald-100 text-emerald-700",
            blue: "bg-blue-100 text-blue-700",
            yellow: "bg-yellow-100 text-yellow-700"
          }[product.imageTone];

          return (
            <Card key={product.id} className="p-4">
              <div className={cn("flex h-32 items-center justify-center rounded-lg", visualClass)}>
                <div className="relative h-20 w-20 rounded-full border border-current/30 bg-white/40">
                  <div className="absolute left-7 top-3 h-12 w-6 rounded-full border-2 border-current bg-white/60" />
                  <div className="absolute bottom-4 left-5 h-2 w-10 rounded-full bg-current" />
                </div>
              </div>
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-court-600">{product.brand}</p>
                  <h3 className="text-xl font-black text-court-900">{product.model}</h3>
                </div>
                <Badge className={lowStock ? "border-orange-200 bg-orange-50 text-orange-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}>
                  {product.stockQuantity} en stock
                </Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-ink-500">{product.description}</p>
              <p className="mt-4 text-2xl font-black text-court-900">{formatEuros(product.priceCents)}</p>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex h-11 items-center rounded-lg border border-court-200 bg-white">
                  <button
                    className="flex h-10 w-10 items-center justify-center text-ink-500 hover:text-court-900"
                    disabled={outOfStock || quantity <= 1}
                    onClick={() => setQuantity(product, quantity - 1)}
                    aria-label="Diminuer la quantité"
                  >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <span className="w-8 text-center text-sm font-black text-court-900">{quantity}</span>
                  <button
                    className="flex h-10 w-10 items-center justify-center text-ink-500 hover:text-court-900"
                    disabled={outOfStock || quantity >= product.stockQuantity}
                    onClick={() => setQuantity(product, quantity + 1)}
                    aria-label="Augmenter la quantité"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <Button
                  className="flex-1"
                  disabled={outOfStock}
                  onClick={() => {
                    const result = createShuttleOrder(product, quantity);
                    setMessage(result.ok ? "Commande réservée. Paiement sur place." : result.message);
                  }}
                >
                  Réserver
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {message ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700" aria-live="polite">
          {message}
        </div>
      ) : null}

      <section className="rounded-lg border border-court-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-court-500" aria-hidden="true" />
          <h2 className="text-xl font-black text-court-900">Mes commandes</h2>
        </div>
        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">Aucune commande pour le moment.</p>
        ) : (
          <div className="mt-4 grid gap-3">
            {orders.map((order) => (
              <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-court-50 px-4 py-3">
                <div>
                  <p className="font-semibold text-court-900">{order.productLabel} · x{order.quantity}</p>
                  <p className="text-sm text-ink-500">Statut : à payer sur place</p>
                </div>
                <p className="font-black text-court-900">{formatEuros(order.totalCents)}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
