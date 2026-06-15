"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface RequestFormProps {
  title: string;
  defaultType?: string;
  messagePlaceholder?: string;
}

const requestTypes = ["Séance d'essai", "Inscription", "Créneaux", "Volants", "Interclubs", "Autre"];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emptyForm = {
  nom: "",
  email: "",
  telephone: "",
  typeDemande: "Séance d'essai",
  message: ""
};

type Feedback = { tone: "success" | "error"; text: string } | null;

export function RequestForm({ title, defaultType = "Séance d'essai", messagePlaceholder }: RequestFormProps) {
  const [form, setForm] = useState({ ...emptyForm, typeDemande: defaultType });
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validate() {
    if (form.nom.trim().length < 2) {
      return "Indiquez votre nom.";
    }

    if (!emailPattern.test(form.email.trim())) {
      return "Indiquez une adresse email valide.";
    }

    if (!form.message.trim()) {
      return "Écrivez votre message.";
    }

    if (form.message.trim().length < 5) {
      return "Écrivez un message un peu plus précis.";
    }

    return null;
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const validationError = validate();
    if (validationError) {
      setFeedback({ tone: "error", text: validationError });
      return;
    }

    setPending(true);

    try {
      const response = await fetch("/api/contact-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nom: form.nom,
          email: form.email,
          telephone: form.telephone,
          typeDemande: form.typeDemande,
          message: form.message
        })
      });

      const result = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !result.ok) {
        setFeedback({ tone: "error", text: result.message ?? "La demande n'a pas pu être envoyée." });
        return;
      }

      setSent(true);
      setFeedback({ tone: "success", text: result.message ?? "Demande envoyée." });
      setForm({ ...emptyForm, typeDemande: defaultType });
    } catch {
      setFeedback({ tone: "error", text: "Connexion impossible. Vérifiez votre réseau puis réessayez." });
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <Card className="p-6" aria-live="polite">
        <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Demande envoyée</p>
        <h2 className="mt-2 text-2xl font-black text-court-900">Merci, le club revient vers vous rapidement.</h2>
        <p className="mt-3 text-sm leading-6 text-ink-500">
          Votre demande a bien été enregistrée. Un responsable du club pourra la traiter depuis Supabase.
        </p>
        <Button
          className="mt-5"
          variant="outline"
          onClick={() => {
            setSent(false);
            setFeedback(null);
          }}
        >
          Envoyer une autre demande
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <Send className="h-6 w-6 text-court-500" aria-hidden="true" />
        <h2 className="text-2xl font-black text-court-900">{title}</h2>
      </div>
      <form className="mt-5 grid gap-4" onSubmit={submit}>
        <label className="grid gap-2 text-sm font-semibold text-court-900">
          Type de demande
          <select
            value={form.typeDemande}
            onChange={(event) => update("typeDemande", event.target.value)}
            className="h-11 rounded-lg border border-court-200 bg-court-50 px-3 outline-none focus:border-court-500 focus:ring-2 focus:ring-court-500/20"
          >
            {requestTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-court-900">
            Nom
            <input
              required
              value={form.nom}
              onChange={(event) => update("nom", event.target.value)}
              autoComplete="name"
              className="h-11 rounded-lg border border-court-200 bg-court-50 px-3 outline-none focus:border-court-500 focus:ring-2 focus:ring-court-500/20"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-court-900">
            Email
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
              autoComplete="email"
              className="h-11 rounded-lg border border-court-200 bg-court-50 px-3 outline-none focus:border-court-500 focus:ring-2 focus:ring-court-500/20"
            />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-semibold text-court-900">
          Téléphone <span className="text-xs font-semibold text-ink-400">optionnel</span>
          <input
            type="tel"
            value={form.telephone}
            onChange={(event) => update("telephone", event.target.value)}
            autoComplete="tel"
            className="h-11 rounded-lg border border-court-200 bg-court-50 px-3 outline-none focus:border-court-500 focus:ring-2 focus:ring-court-500/20"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-court-900">
          Message
          <textarea
            required
            rows={5}
            value={form.message}
            onChange={(event) => update("message", event.target.value)}
            placeholder={messagePlaceholder ?? "Indiquez votre âge ou celui de votre enfant, votre niveau et vos disponibilités."}
            className="rounded-lg border border-court-200 bg-court-50 px-3 py-3 outline-none focus:border-court-500 focus:ring-2 focus:ring-court-500/20"
          />
        </label>
        {feedback ? (
          <p
            className={`rounded-lg px-4 py-3 text-sm font-semibold ${
              feedback.tone === "success" ? "bg-court-100 text-court-900" : "bg-orange-50 text-orange-700"
            }`}
            role={feedback.tone === "error" ? "alert" : "status"}
            aria-live="polite"
          >
            {feedback.text}
          </p>
        ) : null}
        <Button type="submit" className="w-full sm:w-fit" disabled={pending}>
          {pending ? "Envoi en cours..." : "Envoyer ma demande"}
        </Button>
      </form>
    </Card>
  );
}
