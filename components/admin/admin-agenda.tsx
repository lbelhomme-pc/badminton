"use client";

import { useEffect, useState } from "react";
import { AdminFeedback, actionFeedback, errorFeedback, loadingFeedback, successFeedback, type AdminFeedbackMessage } from "@/components/admin/admin-feedback";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminRoute } from "@/components/auth/admin-route";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  createEvent,
  deleteEvent,
  deleteEventPermanently,
  duplicateEvent,
  fetchAdminEvents,
  restoreEvent,
  updateEvent,
  type EventInput,
  type EventRow
} from "@/services/supabase-data.service";

const categoryOptions = [
  { value: "club_event", label: "Événement du club" },
  { value: "competition", label: "Compétition" },
  { value: "meeting", label: "Réunion" },
  { value: "camp", label: "Stage" },
  { value: "closure", label: "Fermeture" }
];

const statusOptions = [
  { value: "draft", label: "Brouillon" },
  { value: "published", label: "Publié" },
  { value: "scheduled", label: "Programmé" },
  { value: "cancelled", label: "Annulé" }
];

type EventForm = {
  titre: string;
  description: string;
  categorie: string;
  statut: string;
  starts_at: string;
  ends_at: string;
  lieu: string;
  public_cible: string;
  image_url: string;
  contact_label: string;
  contact_href: string;
  lien_url: string;
  piece_jointe_url: string;
  visible_public: boolean;
  scheduled_for: string;
  cancellation_message: string;
  recurrence_rule: string;
  exception_date: string;
};

const emptyForm: EventForm = {
  titre: "",
  description: "",
  categorie: "club_event",
  statut: "draft",
  starts_at: "",
  ends_at: "",
  lieu: "",
  public_cible: "",
  image_url: "",
  contact_label: "",
  contact_href: "",
  lien_url: "",
  piece_jointe_url: "",
  visible_public: true,
  scheduled_for: "",
  cancellation_message: "",
  recurrence_rule: "",
  exception_date: ""
};

function toLocalInputValue(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function fromLocalInputValue(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function cleanOptionalText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function cleanOptionalUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;

  try {
    const url = new URL(trimmed);
    if (url.protocol === "https:" || url.protocol === "http:" || url.protocol === "mailto:") return trimmed;
  } catch {
    return null;
  }

  return null;
}

function formFromEvent(event: EventRow): EventForm {
  return {
    titre: event.titre,
    description: event.description,
    categorie: event.categorie,
    statut: event.statut,
    starts_at: toLocalInputValue(event.starts_at),
    ends_at: toLocalInputValue(event.ends_at),
    lieu: event.lieu ?? "",
    public_cible: event.public_cible ?? "",
    image_url: event.image_url ?? "",
    contact_label: event.contact_label ?? "",
    contact_href: event.contact_href ?? "",
    lien_url: event.lien_url ?? "",
    piece_jointe_url: event.piece_jointe_url ?? "",
    visible_public: event.visible_public,
    scheduled_for: toLocalInputValue(event.scheduled_for),
    cancellation_message: event.cancellation_message ?? "",
    recurrence_rule: event.recurrence_rule ?? "",
    exception_date: event.exception_date ?? ""
  };
}

function parseEventForm(form: EventForm, userId?: string | null): { input: EventInput; error: string | null } {
  const titre = form.titre.trim();
  const description = form.description.trim();
  const startsAt = fromLocalInputValue(form.starts_at);
  const endsAt = fromLocalInputValue(form.ends_at);
  const scheduledFor = fromLocalInputValue(form.scheduled_for);

  if (!titre) return { input: {} as EventInput, error: "Le titre est obligatoire." };
  if (!description) return { input: {} as EventInput, error: "La description est obligatoire." };
  if (!startsAt) return { input: {} as EventInput, error: "La date de début est obligatoire." };
  if (endsAt && new Date(endsAt) <= new Date(startsAt)) return { input: {} as EventInput, error: "La fin doit être après le début." };
  if (form.statut === "scheduled" && !scheduledFor) return { input: {} as EventInput, error: "Un événement programmé doit avoir une date de publication." };
  if (form.statut === "cancelled" && !form.cancellation_message.trim()) return { input: {} as EventInput, error: "Une annulation doit contenir un message." };

  const invalidUrl = [
    ["image", form.image_url],
    ["lien externe", form.lien_url],
    ["pièce jointe", form.piece_jointe_url],
    ["contact", form.contact_href]
  ].find(([, value]) => value.trim() && !cleanOptionalUrl(value));

  if (invalidUrl) return { input: {} as EventInput, error: `URL invalide pour ${invalidUrl[0]}.` };

  const input: EventInput = {
    titre,
    description,
    categorie: form.categorie,
    statut: form.statut,
    starts_at: startsAt,
    ends_at: endsAt,
    lieu: cleanOptionalText(form.lieu),
    public_cible: cleanOptionalText(form.public_cible),
    image_url: cleanOptionalUrl(form.image_url),
    contact_label: cleanOptionalText(form.contact_label),
    contact_href: cleanOptionalUrl(form.contact_href),
    lien_url: cleanOptionalUrl(form.lien_url),
    piece_jointe_url: cleanOptionalUrl(form.piece_jointe_url),
    visible_public: form.visible_public,
    published_at: form.statut === "published" || form.statut === "cancelled" ? new Date().toISOString() : null,
    scheduled_for: form.statut === "scheduled" ? scheduledFor : null,
    cancellation_message: form.statut === "cancelled" ? form.cancellation_message.trim() : null,
    recurrence_rule: cleanOptionalText(form.recurrence_rule),
    exception_date: cleanOptionalText(form.exception_date),
    created_by: userId ?? null
  };

  return { input, error: null };
}

export function AdminAgenda() {
  return (
    <AdminRoute requiredRole="manager">
      <AdminAgendaContent />
    </AdminRoute>
  );
}

function AdminAgendaContent() {
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [editing, setEditing] = useState<Record<number, EventForm>>({});
  const [feedback, setFeedback] = useState<AdminFeedbackMessage>(null);

  async function load() {
    const result = await fetchAdminEvents();
    setEvents(result.data);
    if (result.error) setFeedback(errorFeedback(result.error));
  }

  useEffect(() => {
    load();
  }, []);

  function updateForm(field: keyof EventForm, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateEdit(id: number, field: keyof EventForm, value: string | boolean) {
    const event = events.find((item) => item.id === id);
    if (!event) return;
    setEditing((current) => ({
      ...current,
      [id]: {
        ...(current[id] ?? formFromEvent(event)),
        [field]: value
      }
    }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseEventForm(form);
    if (parsed.error) {
      setFeedback(errorFeedback(parsed.error));
      return;
    }

    setFeedback(loadingFeedback("Création de l'événement en cours..."));
    const result = await createEvent(parsed.input);
    setFeedback(actionFeedback(result));
    if (result.ok) {
      setForm(emptyForm);
      await load();
    }
  }

  async function save(event: EventRow) {
    const current = editing[event.id] ?? formFromEvent(event);
    const parsed = parseEventForm(current);
    if (parsed.error) {
      setFeedback(errorFeedback(parsed.error));
      return;
    }

    setFeedback(loadingFeedback("Mise à jour de l'événement..."));
    const result = await updateEvent(event.id, parsed.input);
    setFeedback(actionFeedback(result));
    if (result.ok) {
      setEditing((state) => {
        const next = { ...state };
        delete next[event.id];
        return next;
      });
      await load();
    }
  }

  async function quickStatus(event: EventRow, statut: EventRow["statut"]) {
    const current = formFromEvent(event);
    let cancellationMessage = event.cancellation_message;

    if (statut === "cancelled") {
      cancellationMessage = window.prompt("Message d'annulation visible publiquement :", event.cancellation_message ?? "Événement annulé.") ?? "";
      if (!cancellationMessage.trim()) {
        setFeedback(errorFeedback("Message d'annulation obligatoire."));
        return;
      }
    }

    const parsed = parseEventForm({ ...current, statut, cancellation_message: cancellationMessage ?? "" });
    if (parsed.error) {
      setFeedback(errorFeedback(parsed.error));
      return;
    }

    setFeedback(loadingFeedback("Changement de statut..."));
    const result = await updateEvent(event.id, parsed.input);
    setFeedback(actionFeedback(result));
    if (result.ok) await load();
  }

  async function duplicate(event: EventRow) {
    setFeedback(loadingFeedback("Duplication de l'événement..."));
    const result = await duplicateEvent(event);
    setFeedback(result.ok ? successFeedback("Copie créée en brouillon.") : actionFeedback(result));
    if (result.ok) await load();
  }

  async function remove(event: EventRow) {
    const confirmed = window.confirm(`Mettre "${event.titre}" dans la corbeille ? Préfère l'annulation si l'événement a déjà été annoncé.`);
    if (!confirmed) return;

    setFeedback(loadingFeedback("Mise en corbeille de l'événement..."));
    const result = await deleteEvent(event.id);
    setFeedback(actionFeedback(result));
    if (result.ok) await load();
  }

  async function restore(event: EventRow) {
    setFeedback(loadingFeedback("Restauration de l'événement..."));
    const result = await restoreEvent(event.id);
    setFeedback(actionFeedback(result));
    if (result.ok) await load();
  }

  async function removePermanently(event: EventRow) {
    if (!isAdmin) {
      setFeedback(errorFeedback("Suppression définitive réservée aux admins."));
      return;
    }

    const confirmed = window.confirm(`Supprimer définitivement "${event.titre}" ? Cette action est irréversible.`);
    if (!confirmed) return;

    setFeedback(loadingFeedback("Suppression définitive..."));
    const result = await deleteEventPermanently(event.id);
    setFeedback(actionFeedback(result));
    if (result.ok) await load();
  }

  return (
    <AdminShell title="Agenda" intro="Créer, modifier, publier, programmer, annuler ou dupliquer les événements visibles dans l'agenda public et l'accueil.">
      <Card className="mt-8 p-5">
        <h2 className="text-xl font-black text-court-900">Nouvel événement</h2>
        <EventFormFields value={form} onChange={updateForm} />
        <form onSubmit={onSubmit}>
          <Button className="mt-5 w-full sm:w-auto" type="submit">
            Créer l'événement
          </Button>
        </form>
      </Card>

      <AdminFeedback feedback={feedback} className="mt-6" />

      <div className="mt-8 grid gap-5">
        {events.length === 0 ? (
          <Card className="p-5 text-sm font-semibold text-ink-500">Aucun événement administrable pour le moment.</Card>
        ) : null}
        {events.map((event) => {
          const current = editing[event.id] ?? formFromEvent(event);
          return (
            <Card key={event.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-xs font-black uppercase text-court-600">{event.deleted_at ? "corbeille" : event.statut}</p>
                  <h2 className="mt-1 text-2xl font-black text-court-900">{event.titre}</h2>
                  <p className="mt-1 text-sm text-ink-500">{new Date(event.starts_at).toLocaleString("fr-FR")}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={() => quickStatus(event, "draft")}>Brouillon</Button>
                  <Button type="button" variant="outline" onClick={() => quickStatus(event, "published")}>Publier</Button>
                  <Button type="button" variant="outline" onClick={() => quickStatus(event, "scheduled")}>Programmer</Button>
                  <Button type="button" variant="outline" onClick={() => quickStatus(event, "cancelled")}>Annuler</Button>
                  <Button type="button" variant="outline" onClick={() => duplicate(event)}>Dupliquer</Button>
                </div>
              </div>

              <div className="mt-5 rounded-lg border border-court-100 bg-court-50 p-4">
                <EventFormFields value={current} onChange={(field, value) => updateEdit(event.id, field, value)} />
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button type="button" onClick={() => save(event)}>Enregistrer</Button>
                  <Button type="button" variant="ghost" onClick={() => setEditing((state) => ({ ...state, [event.id]: formFromEvent(event) }))}>
                    Réinitialiser
                  </Button>
                  {event.deleted_at ? (
                    <Button type="button" variant="outline" onClick={() => restore(event)}>
                      Restaurer
                    </Button>
                  ) : null}
                  <Button type="button" variant="danger" onClick={() => remove(event)}>
                    Mettre à la corbeille
                  </Button>
                  {isAdmin && event.deleted_at ? (
                    <Button type="button" variant="danger" onClick={() => removePermanently(event)}>
                      Supprimer définitivement
                    </Button>
                  ) : null}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </AdminShell>
  );
}

function EventFormFields({ value, onChange }: { value: EventForm; onChange: (field: keyof EventForm, value: string | boolean) => void }) {
  return (
    <div className="mt-5 grid gap-4 md:grid-cols-2">
      <AdminInput label="Titre" value={value.titre} onChange={(next) => onChange("titre", next)} />
      <AdminSelect label="Catégorie" value={value.categorie} onChange={(next) => onChange("categorie", next)} options={categoryOptions} />
      <AdminSelect label="Statut" value={value.statut} onChange={(next) => onChange("statut", next)} options={statusOptions} />
      <AdminInput label="Début" type="datetime-local" value={value.starts_at} onChange={(next) => onChange("starts_at", next)} />
      <AdminInput label="Fin" type="datetime-local" required={false} value={value.ends_at} onChange={(next) => onChange("ends_at", next)} />
      <AdminInput label="Publication programmée" type="datetime-local" required={false} value={value.scheduled_for} onChange={(next) => onChange("scheduled_for", next)} />
      <AdminInput label="Lieu" required={false} value={value.lieu} onChange={(next) => onChange("lieu", next)} />
      <AdminInput label="Public concerné" required={false} value={value.public_cible} onChange={(next) => onChange("public_cible", next)} />
      <AdminInput label="Image URL" required={false} value={value.image_url} onChange={(next) => onChange("image_url", next)} />
      <AdminInput label="Lien externe" required={false} value={value.lien_url} onChange={(next) => onChange("lien_url", next)} />
      <AdminInput label="Pièce jointe URL" required={false} value={value.piece_jointe_url} onChange={(next) => onChange("piece_jointe_url", next)} />
      <AdminInput label="Contact libellé" required={false} value={value.contact_label} onChange={(next) => onChange("contact_label", next)} />
      <AdminInput label="Contact lien" required={false} value={value.contact_href} onChange={(next) => onChange("contact_href", next)} />
      <AdminInput label="Récurrence" required={false} value={value.recurrence_rule} onChange={(next) => onChange("recurrence_rule", next)} />
      <AdminInput label="Date d'exception" type="date" required={false} value={value.exception_date} onChange={(next) => onChange("exception_date", next)} />
      <label className="flex items-center gap-3 text-sm font-semibold text-court-900">
        <input
          type="checkbox"
          checked={value.visible_public}
          onChange={(event) => onChange("visible_public", event.target.checked)}
          className="h-4 w-4 rounded border-court-300 text-court-600 focus:ring-court-500"
        />
        Visible sur le site public
      </label>
      <AdminTextarea label="Description" value={value.description} onChange={(next) => onChange("description", next)} />
      <AdminTextarea label="Message d'annulation" required={false} value={value.cancellation_message} onChange={(next) => onChange("cancellation_message", next)} />
    </div>
  );
}

function AdminInput({
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
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-lg border border-court-200 bg-white px-3 outline-none focus:border-court-500 focus:ring-2 focus:ring-court-500/20"
      />
    </label>
  );
}

function AdminSelect({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-court-900">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-lg border border-court-200 bg-white px-3 outline-none focus:border-court-500 focus:ring-2 focus:ring-court-500/20"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function AdminTextarea({
  label,
  value,
  onChange,
  required = true
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-court-900 md:col-span-2">
      {label}
      <textarea
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-24 rounded-lg border border-court-200 bg-white px-3 py-3 outline-none focus:border-court-500 focus:ring-2 focus:ring-court-500/20"
      />
    </label>
  );
}
