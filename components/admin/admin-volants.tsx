"use client";

import { useEffect, useState } from "react";
import { AdminFeedback, actionFeedback, errorFeedback, successFeedback, type AdminFeedbackMessage } from "@/components/admin/admin-feedback";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminRoute } from "@/components/auth/admin-route";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  createDirectCommandeVolants,
  createVolant,
  fetchMemberChoicesForManager,
  fetchShuttleOrdersForManager,
  fetchVolants,
  updateVolant,
  type MemberChoiceRow,
  type ShuttleOrderAdminRow,
  type VolantRow
} from "@/services/supabase-data.service";

export function AdminVolants() {
  return (
    <AdminRoute requiredRole="manager">
      <AdminVolantsContent />
    </AdminRoute>
  );
}

function AdminVolantsContent() {
  const [volants, setVolants] = useState<VolantRow[]>([]);
  const [members, setMembers] = useState<MemberChoiceRow[]>([]);
  const [orders, setOrders] = useState<ShuttleOrderAdminRow[]>([]);
  const [form, setForm] = useState({ marque: "", modele: "", type: "plume", prix: "22", stock: "12" });
  const [quickSale, setQuickSale] = useState({ userId: "", volantId: "", quantite: "1" });
  const [restockById, setRestockById] = useState<Record<number, string>>({});
  const [priceById, setPriceById] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<AdminFeedbackMessage>(null);

  async function load() {
    const [result, membersResult, ordersResult] = await Promise.all([
      fetchVolants(),
      fetchMemberChoicesForManager(),
      fetchShuttleOrdersForManager(10)
    ]);

    setVolants(result.data);
    setMembers(membersResult.data);
    setOrders(ordersResult.data);
    setPriceById(
      Object.fromEntries(result.data.map((volant) => [volant.id, Number(volant.prix).toFixed(2)]))
    );
    const error = result.error || membersResult.error || ordersResult.error;
    if (error) {
      setFeedback(errorFeedback(error));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await createVolant({
      marque: form.marque.trim(),
      modele: form.modele.trim() || null,
      type: form.type,
      prix: Number((form.prix || "0").replace(",", ".")),
      stock: Math.max(0, Math.floor(Number((form.stock || "0").replace(",", ".")))),
      actif: true
    });
    setFeedback(actionFeedback(result));
    if (result.ok) {
      setForm({ marque: "", modele: "", type: "plume", prix: "22", stock: "12" });
      await load();
    }
  }

  async function patchVolant(id: number, input: Partial<VolantRow>) {
    const result = await updateVolant(id, input);
    setFeedback(actionFeedback(result));
    if (result.ok) await load();
  }

  async function updateVolantPrice(volant: VolantRow) {
    const nextPrice = Number((priceById[volant.id] ?? "").replace(",", "."));

    if (!Number.isFinite(nextPrice) || nextPrice < 0) {
      setFeedback(errorFeedback("Indique un prix valide, par exemple 22,50."));
      return;
    }

    const roundedPrice = Math.round(nextPrice * 100) / 100;
    const result = await updateVolant(volant.id, { prix: roundedPrice });
    setFeedback(
      result.ok
        ? successFeedback(`Prix du volant ${volant.marque} mis à jour à ${roundedPrice.toFixed(2)} €.`)
        : actionFeedback(result)
    );

    if (result.ok) {
      await load();
    }
  }

  async function restockVolant(volant: VolantRow) {
    const quantity = Math.floor(Number(restockById[volant.id] ?? 0));

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setFeedback(errorFeedback("Indique un nombre de tubes a ajouter au stock."));
      return;
    }

    const result = await updateVolant(volant.id, { stock: volant.stock + quantity });
    setFeedback(result.ok ? successFeedback(`${quantity} tube(s) ajoute(s) au stock ${volant.marque}.`) : actionFeedback(result));

    if (result.ok) {
      setRestockById((current) => ({ ...current, [volant.id]: "" }));
      await load();
    }
  }

  async function onQuickSale(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const quantite = Math.max(1, Math.floor(Number(quickSale.quantite || 1)));
    const volantId = Number(quickSale.volantId);
    const selectedVolant = volants.find((volant) => volant.id === volantId);

    if (!quickSale.userId) {
      setFeedback(errorFeedback("Choisis l'adhérent qui achète les volants."));
      return;
    }

    if (!selectedVolant) {
      setFeedback(errorFeedback("Choisis un modèle de volant."));
      return;
    }

    if (quantite > selectedVolant.stock) {
      setFeedback(errorFeedback("La quantité vendue dépasse le stock disponible."));
      return;
    }

    const result = await createDirectCommandeVolants({
      userId: quickSale.userId,
      volantId,
      quantite
    });

    setFeedback(actionFeedback(result));
    if (result.ok) {
      setQuickSale((current) => ({ ...current, volantId: "", quantite: "1" }));
      await load();
    }
  }

  function memberLabel(member: MemberChoiceRow) {
    const name = member.display_name?.trim();
    if (name) return member.email ? `${name} · ${member.email}` : name;
    return member.email ?? "Adhérent sans nom";
  }

  return (
    <AdminShell title="Gestion des volants" intro="Ajouter un modèle, corriger un écart ou saisir un réassort quand le club achète des tubes.">
      <a
        href="#vente-rapide-volants"
        className="fixed bottom-20 left-4 right-4 z-40 inline-flex h-12 items-center justify-center rounded-lg bg-court-500 text-sm font-black text-white shadow-soft md:hidden"
      >
        Vente rapide sur place
      </a>

      <Card className="p-5">
        <h2 className="text-xl font-black text-court-900">Nouveau volant</h2>
        <form className="mt-5 grid gap-4 md:grid-cols-5" onSubmit={onSubmit}>
          <VolantInput label="Marque" value={form.marque} onChange={(value) => setForm((current) => ({ ...current, marque: value }))} />
          <VolantInput label="Modèle" required={false} value={form.modele} onChange={(value) => setForm((current) => ({ ...current, modele: value }))} />
          <label className="grid gap-2 text-sm font-semibold text-court-900">
            Type
            <select
              value={form.type}
              onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
              className="h-11 rounded-lg border border-court-200 bg-court-50 px-3"
            >
              <option value="plastique">plastique</option>
              <option value="plume">plume</option>
              <option value="hybride">hybride</option>
            </select>
          </label>
          <VolantInput label="Prix" type="number" value={form.prix} onChange={(value) => setForm((current) => ({ ...current, prix: value }))} />
          <VolantInput label="Stock" type="number" value={form.stock} onChange={(value) => setForm((current) => ({ ...current, stock: value }))} />
          <Button type="submit" className="md:col-span-5">Ajouter au stock</Button>
        </form>
      </Card>

      <AdminFeedback feedback={feedback} className="mt-6" />

      <Card id="vente-rapide-volants" className="mt-8 scroll-mt-24 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-court-900">Vente rapide sur place</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500">
              À utiliser quand un adhérent prend des volants directement à la salle. La vente est enregistrée avec son nom,
              le statut passe en remis et le stock baisse automatiquement.
            </p>
          </div>
        </div>
        <form className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_1fr_0.5fr_auto]" onSubmit={onQuickSale}>
          <label className="grid gap-2 text-sm font-semibold text-court-900">
            Adhérent
            <select
              value={quickSale.userId}
              onChange={(event) => setQuickSale((current) => ({ ...current, userId: event.target.value }))}
              className="h-11 rounded-lg border border-court-200 bg-court-50 px-3"
            >
              <option value="">Choisir un adhérent</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {memberLabel(member)}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-court-900">
            Volants
            <select
              value={quickSale.volantId}
              onChange={(event) => setQuickSale((current) => ({ ...current, volantId: event.target.value }))}
              className="h-11 rounded-lg border border-court-200 bg-court-50 px-3"
            >
              <option value="">Choisir un modèle</option>
              {volants.filter((volant) => volant.actif).map((volant) => (
                <option key={volant.id} value={volant.id}>
                  {volant.marque} {volant.modele ?? ""} · stock {volant.stock}
                </option>
              ))}
            </select>
          </label>
          <VolantInput
            label="Tubes"
            type="number"
            value={quickSale.quantite}
            onChange={(value) => setQuickSale((current) => ({ ...current, quantite: value }))}
          />
          <div className="flex items-end gap-2 lg:hidden">
            {[1, 2, 3].map((quantity) => (
              <Button
                key={quantity}
                type="button"
                variant={quickSale.quantite === String(quantity) ? "primary" : "outline"}
                className="flex-1"
                onClick={() => setQuickSale((current) => ({ ...current, quantite: String(quantity) }))}
              >
                {quantity}
              </Button>
            ))}
          </div>
          <Button type="submit" className="self-end">
            Enregistrer la vente
          </Button>
        </form>
      </Card>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {volants.map((volant) => (
          <Card key={volant.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-court-900">{volant.marque}</h2>
                <p className="mt-1 text-sm text-ink-500">{volant.modele || "Modèle non précisé"} · {volant.type}</p>
              </div>
              <span className={volant.actif ? "rounded-full bg-court-100 px-3 py-1 text-xs font-black text-court-600" : "rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700"}>
                {volant.actif ? "Actif" : "Masqué"}
              </span>
            </div>
            <p className="mt-4 text-3xl font-black text-court-900">{volant.stock}</p>
            <p className="text-sm text-ink-500">{Number(volant.prix).toFixed(2)} € le tube</p>
            <div className="mt-5 rounded-2xl border border-court-100 bg-white p-3">
              <label className="text-sm font-bold text-court-900" htmlFor={`price-${volant.id}`}>
                Prix du tube
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id={`price-${volant.id}`}
                  min="0"
                  step="0.01"
                  type="number"
                  inputMode="decimal"
                  value={priceById[volant.id] ?? Number(volant.prix).toFixed(2)}
                  onChange={(event) => setPriceById((current) => ({ ...current, [volant.id]: event.target.value }))}
                  className="h-11 min-w-0 flex-1 rounded-lg border border-court-200 bg-court-50 px-3 text-sm"
                />
                <Button type="button" onClick={() => updateVolantPrice(volant)}>
                  Enregistrer
                </Button>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-court-100 bg-court-50 p-3">
              <label className="text-sm font-bold text-court-900" htmlFor={`restock-${volant.id}`}>
                Réassort club
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id={`restock-${volant.id}`}
                  min="1"
                  type="number"
                  inputMode="numeric"
                  value={restockById[volant.id] ?? ""}
                  onChange={(event) => setRestockById((current) => ({ ...current, [volant.id]: event.target.value }))}
                  placeholder="Nombre de tubes"
                  className="h-11 min-w-0 flex-1 rounded-lg border border-court-200 bg-white px-3 text-sm"
                />
                <Button type="button" onClick={() => restockVolant(volant)}>
                  Ajouter
                </Button>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => patchVolant(volant.id, { stock: Math.max(0, volant.stock - 1) })}>
                Correction -1 sans acheteur
              </Button>
              <Button variant="outline" onClick={() => patchVolant(volant.id, { stock: volant.stock + 1 })}>
                Correction +1
              </Button>
              <Button variant="outline" onClick={() => patchVolant(volant.id, { actif: !volant.actif })}>
                {volant.actif ? "Masquer" : "Afficher"}
              </Button>
            </div>
          </Card>
        ))}
      </section>

      <Card className="mt-8 p-5">
        <h2 className="text-xl font-black text-court-900">Derniers achats de volants</h2>
        <p className="mt-2 text-sm leading-6 text-ink-500">
          Ces lignes viennent de la table `commandes_volants` : elles indiquent qui a commandé ou acheté des volants.
        </p>
        {orders.length === 0 ? (
          <p className="mt-4 rounded-lg bg-court-50 p-4 text-sm font-semibold text-ink-500">Aucun achat enregistré pour le moment.</p>
        ) : (
          <div className="mt-4 grid gap-3">
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg border border-court-100 bg-court-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-court-900">{order.buyer_name || order.buyer_email || "Adhérent"}</p>
                    {order.buyer_email ? <p className="text-xs font-semibold text-ink-500">{order.buyer_email}</p> : null}
                    <p className="mt-2 text-sm text-ink-500">
                      {order.quantite} tube{order.quantite > 1 ? "s" : ""} · {order.volant_label || "Volants"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase text-court-700">{order.statut}</span>
                    <p className="mt-2 text-sm font-semibold text-court-900">
                      {order.total != null ? `${Number(order.total).toFixed(2)} €` : "Total non renseigné"}
                    </p>
                    <p className="mt-1 text-xs text-ink-500">{new Date(order.created_at).toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </AdminShell>
  );
}

function VolantInput({
  label,
  value,
  onChange,
  type = "text",
  required = true
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-court-900">
      {label}
      <input
        required={required}
        type={type}
        step={type === "number" ? "0.01" : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-lg border border-court-200 bg-court-50 px-3"
      />
    </label>
  );
}
