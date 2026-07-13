"use client";

import { useEffect, useState } from "react";
import { AdminFeedback, actionFeedback, errorFeedback, loadingFeedback, successFeedback, type AdminFeedbackMessage } from "@/components/admin/admin-feedback";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminRoute } from "@/components/auth/admin-route";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { shuttleOrderStatusLabel } from "@/lib/status-labels";
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

type VolantFormState = {
  reference: string;
  marque: string;
  modele: string;
  type: string;
  quantite_boite: string;
  prix: string;
  stock: string;
  disponibilite: string;
  limite_commande: string;
  photo_url: string;
  instructions_retrait: string;
  helloasso_url: string;
  helloasso_item_id: string;
  actif: boolean;
};

type ParsedVolantForm =
  | { ok: true; input: Omit<VolantRow, "id"> }
  | { ok: false; message: string };

const VOLANT_TYPES = ["plastique", "plume", "hybride"] as const;

const emptyVolantForm: VolantFormState = {
  reference: "",
  marque: "",
  modele: "",
  type: "plume",
  quantite_boite: "12",
  prix: "22.00",
  stock: "12",
  disponibilite: "disponible",
  limite_commande: "4",
  photo_url: "",
  instructions_retrait: "Retrait auprès du responsable volants à la salle.",
  helloasso_url: "",
  helloasso_item_id: "",
  actif: true
};

export function AdminVolants() {
  return (
    <AdminRoute requiredRole="manager">
      <AdminVolantsContent />
    </AdminRoute>
  );
}

function volantToForm(volant: VolantRow): VolantFormState {
  return {
    reference: volant.reference ?? "",
    marque: volant.marque,
    modele: volant.modele ?? "",
    type: volant.type,
    quantite_boite: String(volant.quantite_boite ?? 12),
    prix: Number(volant.prix).toFixed(2),
    stock: String(volant.stock),
    disponibilite: volant.disponibilite ?? (volant.stock > 0 ? "disponible" : "indisponible"),
    limite_commande: String(volant.limite_commande ?? 4),
    photo_url: volant.photo_url ?? "",
    instructions_retrait: volant.instructions_retrait ?? "",
    helloasso_url: volant.helloasso_url ?? "",
    helloasso_item_id: volant.helloasso_item_id ?? "",
    actif: volant.actif
  };
}

function parseEuro(value: string) {
  return Number(value.replace(",", "."));
}

function parseVolantForm(form: VolantFormState): ParsedVolantForm {
  const marque = form.marque.trim();
  const modele = form.modele.trim();
  const prix = parseEuro(form.prix || "0");
  const stock = Number(form.stock);
  const quantiteBoite = Number(form.quantite_boite);
  const limiteCommande = Number(form.limite_commande);
  const helloassoUrl = form.helloasso_url.trim();

  if (!marque) {
    return { ok: false, message: "Le nom ou la marque du volant est obligatoire." };
  }

  if (!VOLANT_TYPES.includes(form.type as (typeof VOLANT_TYPES)[number])) {
    return { ok: false, message: "Choisis un type de volant valide." };
  }

  if (!Number.isFinite(prix) || prix <= 0) {
    return { ok: false, message: "Indique un prix positif, par exemple 22,50." };
  }

  if (!Number.isInteger(stock) || stock < 0) {
    return { ok: false, message: "Le stock doit être un nombre entier positif." };
  }

  if (!Number.isInteger(quantiteBoite) || quantiteBoite <= 0) {
    return { ok: false, message: "La quantité par boîte doit être un entier positif." };
  }

  if (!Number.isInteger(limiteCommande) || limiteCommande <= 0) {
    return { ok: false, message: "La limite par commande doit être un entier positif." };
  }

  if (!["disponible", "indisponible"].includes(form.disponibilite)) {
    return { ok: false, message: "Choisis une disponibilité valide." };
  }

  if (helloassoUrl && !helloassoUrl.startsWith("https://")) {
    return { ok: false, message: "Le lien HelloAsso doit commencer par https://." };
  }

  return {
    ok: true,
    input: {
      marque,
      modele: modele || null,
      type: form.type,
      reference: form.reference.trim() || null,
      quantite_boite: quantiteBoite,
      prix: Math.round(prix * 100) / 100,
      stock,
      disponibilite: form.disponibilite,
      limite_commande: limiteCommande,
      photo_url: form.photo_url.trim() || null,
      instructions_retrait: form.instructions_retrait.trim() || null,
      helloasso_url: helloassoUrl || null,
      helloasso_item_id: form.helloasso_item_id.trim() || null,
      payment_provider: "helloasso",
      actif: form.actif
    }
  };
}

function AdminVolantsContent() {
  const [volants, setVolants] = useState<VolantRow[]>([]);
  const [members, setMembers] = useState<MemberChoiceRow[]>([]);
  const [orders, setOrders] = useState<ShuttleOrderAdminRow[]>([]);
  const [form, setForm] = useState<VolantFormState>(emptyVolantForm);
  const [editById, setEditById] = useState<Record<number, VolantFormState>>({});
  const [quickSale, setQuickSale] = useState({ userId: "", volantId: "", quantite: "1" });
  const [restockById, setRestockById] = useState<Record<number, string>>({});
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
    setEditById(Object.fromEntries(result.data.map((volant) => [volant.id, volantToForm(volant)])));

    const error = result.error || membersResult.error || ordersResult.error;
    if (error) {
      setFeedback(errorFeedback(error));
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateForm(field: keyof VolantFormState, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateEdit(id: number, field: keyof VolantFormState, value: string | boolean) {
    setEditById((current) => ({
      ...current,
      [id]: {
        ...(current[id] ?? emptyVolantForm),
        [field]: value
      }
    }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseVolantForm(form);

    if (!parsed.ok) {
      setFeedback(errorFeedback(parsed.message));
      return;
    }

    setFeedback(loadingFeedback("Ajout du volant en cours..."));
    const result = await createVolant(parsed.input);
    setFeedback(result.ok ? successFeedback("Volant ajouté.") : actionFeedback(result));

    if (result.ok) {
      setForm(emptyVolantForm);
      await load();
    }
  }

  async function saveVolant(volant: VolantRow) {
    const parsed = parseVolantForm(editById[volant.id] ?? volantToForm(volant));

    if (!parsed.ok) {
      setFeedback(errorFeedback(parsed.message));
      return;
    }

    setFeedback(loadingFeedback("Mise à jour du volant en cours..."));
    const result = await updateVolant(volant.id, parsed.input);
    setFeedback(
      result.ok
        ? successFeedback(`${parsed.input.marque} mis à jour. Le prix affiché aux adhérents sera ${Number(parsed.input.prix).toFixed(2)} €.`)
        : actionFeedback(result)
    );

    if (result.ok) {
      await load();
    }
  }

  async function patchVolant(id: number, input: Partial<VolantRow>, successMessage = "Volant mis à jour.") {
    setFeedback(loadingFeedback("Mise à jour du volant en cours..."));
    const result = await updateVolant(id, input);
    setFeedback(result.ok ? successFeedback(successMessage) : actionFeedback(result));
    if (result.ok) await load();
  }

  async function restockVolant(volant: VolantRow) {
    const quantity = Math.floor(Number(restockById[volant.id] ?? 0));

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setFeedback(errorFeedback("Indique un nombre de tubes à ajouter au stock."));
      return;
    }

    setFeedback(loadingFeedback("Réassort du stock en cours..."));
    const result = await updateVolant(volant.id, { stock: volant.stock + quantity });
    setFeedback(result.ok ? successFeedback(`${quantity} tube(s) ajouté(s) au stock ${volant.marque}.`) : actionFeedback(result));

    if (result.ok) {
      setRestockById((current) => ({ ...current, [volant.id]: "" }));
      await load();
    }
  }

  function selectedQuickSaleVolant() {
    return volants.find((volant) => volant.id === Number(quickSale.volantId));
  }

  function quickSaleQuantity() {
    return Math.max(1, Math.floor(Number(quickSale.quantite || 1)));
  }

  function setQuickSaleQuantity(value: number) {
    const selectedVolant = selectedQuickSaleVolant();
    const max = selectedVolant ? Math.max(1, selectedVolant.stock) : 99;
    const nextQuantity = Math.min(Math.max(1, Math.floor(value || 1)), max);
    setQuickSale((current) => ({ ...current, quantite: String(nextQuantity) }));
  }

  async function onQuickSale(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const quantite = quickSaleQuantity();
    const volantId = Number(quickSale.volantId);
    const selectedVolant = selectedQuickSaleVolant();

    if (!quickSale.userId) {
      setFeedback(errorFeedback("Choisis l'adhérent qui achète les volants."));
      return;
    }

    if (!selectedVolant) {
      setFeedback(errorFeedback("Choisis un modèle de volant."));
      return;
    }

    if (selectedVolant.stock <= 0) {
      setFeedback(errorFeedback("Ce modèle est en rupture de stock."));
      return;
    }

    if (quantite > selectedVolant.stock) {
      setFeedback(errorFeedback("La quantité vendue dépasse le stock disponible."));
      return;
    }

    const confirmed = window.confirm(
      `Enregistrer la vente de ${quantite} tube${quantite > 1 ? "s" : ""} ${selectedVolant.marque} ? Le stock sera diminué automatiquement.`
    );
    if (!confirmed) return;

    setFeedback(loadingFeedback("Enregistrement de la vente sur place en cours..."));
    const result = await createDirectCommandeVolants({
      userId: quickSale.userId,
      volantId,
      quantite
    });

    setFeedback(result.ok ? successFeedback("Vente sur place enregistrée. Le stock a été mis à jour.") : actionFeedback(result));

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

  const quickVolant = selectedQuickSaleVolant();
  const quickQuantity = quickSaleQuantity();
  const quickTotal = quickVolant ? Number(quickVolant.prix) * quickQuantity : 0;
  const quickBlocked = quickVolant ? quickVolant.stock <= 0 || quickQuantity > quickVolant.stock : false;

  return (
    <AdminShell
      title="Gestion des volants"
      intro="Ajouter un modèle, modifier les prix, corriger le stock et saisir les ventes rapides à la salle."
    >
      <a
        href="#vente-rapide-volants"
        className="fixed bottom-20 left-4 right-4 z-40 inline-flex h-12 items-center justify-center rounded-lg bg-court-500 text-sm font-black text-white shadow-soft md:hidden"
      >
        Vente rapide sur place
      </a>

      <Card className="p-5">
        <h2 className="text-xl font-black text-court-900">Nouveau volant</h2>
        <form className="mt-5 grid gap-4 md:grid-cols-5" onSubmit={onSubmit}>
          <VolantInput label="Référence interne" required={false} value={form.reference} onChange={(value) => updateForm("reference", value)} />
          <VolantInput label="Marque ou nom" value={form.marque} onChange={(value) => updateForm("marque", value)} />
          <VolantInput label="Modèle" required={false} value={form.modele} onChange={(value) => updateForm("modele", value)} />
          <VolantTypeSelect value={form.type} onChange={(value) => updateForm("type", value)} />
          <VolantInput label="Volants par boîte" type="number" min="1" step="1" value={form.quantite_boite} onChange={(value) => updateForm("quantite_boite", value)} />
          <VolantInput label="Prix en euros" inputMode="decimal" value={form.prix} onChange={(value) => updateForm("prix", value)} />
          <VolantInput label="Stock" type="number" min="0" step="1" value={form.stock} onChange={(value) => updateForm("stock", value)} />
          <VolantAvailabilitySelect value={form.disponibilite} onChange={(value) => updateForm("disponibilite", value)} />
          <VolantInput label="Limite par commande" type="number" min="1" step="1" value={form.limite_commande} onChange={(value) => updateForm("limite_commande", value)} />
          <VolantInput label="Photo URL" required={false} value={form.photo_url} onChange={(value) => updateForm("photo_url", value)} />
          <VolantInput label="Lien HelloAsso" required={false} value={form.helloasso_url} onChange={(value) => updateForm("helloasso_url", value)} />
          <VolantInput label="ID HelloAsso" required={false} value={form.helloasso_item_id} onChange={(value) => updateForm("helloasso_item_id", value)} />
          <VolantInput label="Instructions retrait" required={false} value={form.instructions_retrait} onChange={(value) => updateForm("instructions_retrait", value)} />
          <Button type="submit" className="md:col-span-5">
            Ajouter le volant
          </Button>
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
        <form className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_1fr_0.7fr_auto]" onSubmit={onQuickSale}>
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
              onChange={(event) => setQuickSale((current) => ({ ...current, volantId: event.target.value, quantite: "1" }))}
              className="h-11 rounded-lg border border-court-200 bg-court-50 px-3"
            >
              <option value="">Choisir un modèle</option>
              {volants.filter((volant) => volant.actif).map((volant) => (
                <option key={volant.id} value={volant.id}>
                  {volant.marque} {volant.modele ?? ""} · {Number(volant.prix).toFixed(2)} € · stock {volant.stock}
                </option>
              ))}
            </select>
          </label>
          <VolantInput
            label="Tubes"
            type="number"
            min="1"
            max={quickVolant ? Math.max(1, quickVolant.stock) : undefined}
            step="1"
            value={quickSale.quantite}
            onChange={(value) => setQuickSaleQuantity(Number(value))}
          />
          <div className="flex items-end gap-2 lg:hidden">
            {[1, 2, 3].map((quantity) => (
              <Button
                key={quantity}
                type="button"
                variant={quickSale.quantite === String(quantity) ? "primary" : "outline"}
                className="flex-1"
                disabled={quickVolant ? quantity > quickVolant.stock : false}
                onClick={() => setQuickSaleQuantity(quantity)}
              >
                {quantity}
              </Button>
            ))}
          </div>
          <Button type="submit" className="w-full self-end lg:w-auto" disabled={quickBlocked}>
            Enregistrer la vente
          </Button>
        </form>
        <p className={`mt-4 rounded-lg px-4 py-3 text-sm font-semibold ${quickBlocked ? "bg-red-50 text-red-700" : "bg-court-50 text-court-800"}`}>
          {quickVolant
            ? quickBlocked
              ? "Stock insuffisant pour cette vente."
              : `Total : ${quickTotal.toFixed(2)} € · stock après vente : ${quickVolant.stock - quickQuantity}`
            : "Choisis un modèle pour voir le total et le stock restant."}
        </p>
      </Card>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {volants.map((volant) => {
          const edit = editById[volant.id] ?? volantToForm(volant);

          return (
            <Card key={volant.id} className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-black text-court-900">{volant.marque}</h2>
                  <p className="mt-1 text-sm text-ink-500">{volant.modele || "Modèle non précisé"} · {volant.type}</p>
                </div>
                <span className={volant.actif ? "rounded-full bg-court-100 px-3 py-1 text-xs font-black text-court-600" : "rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700"}>
                  {volant.actif ? "Actif" : "Masqué"}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-court-50 p-4 text-sm">
                <div>
                  <p className="font-semibold text-ink-500">Stock actuel</p>
                  <p className="text-2xl font-black text-court-900">{volant.stock}</p>
                </div>
                <div>
                  <p className="font-semibold text-ink-500">Prix actuel</p>
                  <p className="text-2xl font-black text-court-900">{Number(volant.prix).toFixed(2)} €</p>
                </div>
              </div>

              <form
                className="mt-5 grid gap-3 rounded-lg border border-court-100 bg-white p-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  saveVolant(volant);
                }}
              >
                <VolantInput label="Marque ou nom" value={edit.marque} onChange={(value) => updateEdit(volant.id, "marque", value)} />
                <VolantInput label="Modèle" required={false} value={edit.modele} onChange={(value) => updateEdit(volant.id, "modele", value)} />
                <VolantInput label="Référence interne" required={false} value={edit.reference} onChange={(value) => updateEdit(volant.id, "reference", value)} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <VolantTypeSelect value={edit.type} onChange={(value) => updateEdit(volant.id, "type", value)} />
                  <VolantAvailabilitySelect value={edit.disponibilite} onChange={(value) => updateEdit(volant.id, "disponibilite", value)} />
                  <VolantInput label="Volants par boîte" type="number" min="1" step="1" value={edit.quantite_boite} onChange={(value) => updateEdit(volant.id, "quantite_boite", value)} />
                  <VolantInput label="Prix en euros" inputMode="decimal" value={edit.prix} onChange={(value) => updateEdit(volant.id, "prix", value)} />
                  <VolantInput label="Stock" type="number" min="0" step="1" value={edit.stock} onChange={(value) => updateEdit(volant.id, "stock", value)} />
                  <VolantInput label="Limite par commande" type="number" min="1" step="1" value={edit.limite_commande} onChange={(value) => updateEdit(volant.id, "limite_commande", value)} />
                  <VolantInput label="Photo URL" required={false} value={edit.photo_url} onChange={(value) => updateEdit(volant.id, "photo_url", value)} />
                  <VolantInput label="Lien HelloAsso" required={false} value={edit.helloasso_url} onChange={(value) => updateEdit(volant.id, "helloasso_url", value)} />
                  <VolantInput label="ID HelloAsso" required={false} value={edit.helloasso_item_id} onChange={(value) => updateEdit(volant.id, "helloasso_item_id", value)} />
                  <VolantInput label="Instructions retrait" required={false} value={edit.instructions_retrait} onChange={(value) => updateEdit(volant.id, "instructions_retrait", value)} />
                  <label className="flex h-11 items-center gap-2 self-end rounded-lg border border-court-200 bg-court-50 px-3 text-sm font-semibold text-court-900">
                    <input
                      type="checkbox"
                      checked={edit.actif}
                      onChange={(event) => updateEdit(volant.id, "actif", event.target.checked)}
                    />
                    Visible adhérents
                  </label>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button type="submit">Enregistrer ce volant</Button>
                  <Button type="button" variant="outline" onClick={() => setEditById((current) => ({ ...current, [volant.id]: volantToForm(volant) }))}>
                    Annuler
                  </Button>
                </div>
              </form>

              <div className="mt-5 rounded-lg border border-court-100 bg-court-50 p-3">
                <label className="text-sm font-bold text-court-900" htmlFor={`restock-${volant.id}`}>
                  Réassort club
                </label>
                <div className="mt-2 grid gap-2 sm:flex">
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
                  <Button className="w-full sm:w-auto" type="button" onClick={() => restockVolant(volant)}>
                    Ajouter
                  </Button>
                </div>
              </div>
              <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap">
                <Button
                  className="w-full sm:w-auto"
                  variant="outline"
                  onClick={() => {
                    const confirmed = window.confirm(`Retirer 1 tube du stock ${volant.marque} sans lier d'acheteur ?`);
                    if (confirmed) {
                      patchVolant(volant.id, { stock: Math.max(0, volant.stock - 1) }, "Stock corrigé : 1 tube retiré.");
                    }
                  }}
                >
                  Correction -1 sans acheteur
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  variant="outline"
                  onClick={() => patchVolant(volant.id, { stock: volant.stock + 1 }, "Stock corrigé : 1 tube ajouté.")}
                >
                  Correction +1
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  variant="outline"
                  onClick={() => {
                    if (volant.actif) {
                      const confirmed = window.confirm(`Masquer ${volant.marque} aux adhérents ?`);
                      if (!confirmed) return;
                    }
                    patchVolant(volant.id, { actif: !volant.actif }, volant.actif ? "Volant masqué aux adhérents." : "Volant visible pour les adhérents.");
                  }}
                >
                  {volant.actif ? "Masquer" : "Afficher"}
                </Button>
              </div>
            </Card>
          );
        })}
      </section>

      <Card className="mt-8 p-5">
        <h2 className="text-xl font-black text-court-900">Derniers achats de volants</h2>
        <p className="mt-2 text-sm leading-6 text-ink-500">
          Ces lignes viennent de la table commandes_volants : elles indiquent qui a commandé ou acheté des volants.
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
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase text-court-700">
                      {shuttleOrderStatusLabel(order.statut)}
                    </span>
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

function VolantTypeSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-court-900">
      Type
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-lg border border-court-200 bg-court-50 px-3"
      >
        {VOLANT_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    </label>
  );
}

function VolantAvailabilitySelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-court-900">
      Disponibilité
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-lg border border-court-200 bg-court-50 px-3"
      >
        <option value="disponible">Disponible</option>
        <option value="indisponible">Indisponible</option>
      </select>
    </label>
  );
}

function VolantInput({
  label,
  value,
  onChange,
  type = "text",
  required = true,
  min,
  max,
  step,
  inputMode
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  min?: string;
  max?: string | number;
  step?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-court-900">
      {label}
      <input
        required={required}
        type={type}
        min={min}
        max={max}
        step={step ?? (type === "number" ? "0.01" : undefined)}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-lg border border-court-200 bg-court-50 px-3"
      />
    </label>
  );
}
