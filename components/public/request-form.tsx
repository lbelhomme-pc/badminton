"use client";

import { useState } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FeedbackMessage } from "@/components/ui/feedback-message";
import { TextAreaField, TextField } from "@/components/ui/form-field";

interface RequestFormProps {
  defaultType?: string;
  messagePlaceholder?: string;
  title: string;
}

const requestTypes = ["Séance d'essai", "Inscription", "Créneaux", "Volants", "Interclubs", "Partenariat", "Autre"];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emptyForm = {
  nom: "",
  email: "",
  telephone: "",
  typeDemande: "Séance d'essai",
  message: "",
  website: "",
  consentRgpd: false
};

type Feedback = { tone: "success" | "error"; text: string } | null;

export function RequestForm({ title, defaultType = "Séance d'essai", messagePlaceholder }: RequestFormProps) {
  const [form, setForm] = useState({ ...emptyForm, typeDemande: defaultType });
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  function update(field: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validate() {
    if (form.nom.trim().length < 2) return "Indiquez votre nom.";
    if (!emailPattern.test(form.email.trim())) return "Indiquez une adresse email valide.";
    if (form.message.trim().length < 5) return "Écrivez un message un peu plus précis.";
    if (!form.consentRgpd) return "Confirmez l'envoi de vos informations au club.";
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
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
        <p className="font-display text-sm font-bold uppercase text-court-600">Demande envoyée</p>
        <h2 className="mt-2 text-2xl font-black text-court-900">Merci, le club revient vers vous rapidement.</h2>
        <p className="mt-3 text-sm leading-6 text-ink-600">
          Votre message a bien été enregistré. Le délai de réponse dépend de la disponibilité des bénévoles du club.
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
        <input
          type="text"
          name="website"
          value={form.website}
          onChange={(event) => update("website", event.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        <label className="grid gap-2 text-sm font-bold text-court-900">
          Objet de la demande
          <select
            value={form.typeDemande}
            onChange={(event) => update("typeDemande", event.target.value)}
            className="h-11 rounded-lg border border-court-200 bg-white px-3 text-base outline-none focus:border-court-500 focus:ring-2 focus:ring-court-500/20"
          >
            {requestTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <TextField id="contact-name" label="Nom" required value={form.nom} onChange={(event) => update("nom", event.target.value)} autoComplete="name" />
          <TextField
            id="contact-email"
            label="Email"
            required
            type="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            autoComplete="email"
          />
        </div>

        <TextField
          id="contact-phone"
          label="Téléphone"
          type="tel"
          value={form.telephone}
          onChange={(event) => update("telephone", event.target.value)}
          autoComplete="tel"
          help="Optionnel. Privilégiez un contact générique si vous écrivez pour une structure."
        />

        <TextAreaField
          id="contact-message"
          label="Message"
          required
          rows={5}
          value={form.message}
          onChange={(event) => update("message", event.target.value)}
          placeholder={messagePlaceholder ?? "Indiquez votre profil, votre question et le créneau ou sujet concerné."}
        />

        <label className="flex gap-3 rounded-lg border border-court-200 bg-court-50 p-3 text-sm leading-6 text-ink-700">
          <input
            type="checkbox"
            checked={form.consentRgpd}
            onChange={(event) => update("consentRgpd", event.target.checked)}
            className="mt-1 h-4 w-4 shrink-0"
          />
          <span>
            J'accepte que les informations transmises soient utilisées par le CFVV pour répondre à ma demande. Aucune donnée bancaire n'est demandée
            dans ce formulaire. Les informations sont traitées selon la{" "}
            <Link href="/confidentialite" className="font-bold underline">
              politique de confidentialité
            </Link>
            .
          </span>
        </label>

        {feedback ? <FeedbackMessage tone={feedback.tone}>{feedback.text}</FeedbackMessage> : null}

        <Button type="submit" className="w-full sm:w-fit" disabled={pending}>
          {pending ? "Envoi en cours..." : "Envoyer ma demande"}
        </Button>
      </form>
    </Card>
  );
}
