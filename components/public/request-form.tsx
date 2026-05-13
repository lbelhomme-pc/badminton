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

export function RequestForm({ title, defaultType = "Séance d’essai", messagePlaceholder }: RequestFormProps) {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <Card className="p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Demande envoyée</p>
        <h2 className="mt-2 text-2xl font-black text-court-900">Merci, le club revient vers vous rapidement.</h2>
        <p className="mt-3 text-sm leading-6 text-ink-500">
          Votre message est bien pris en compte par le club.
        </p>
        <Button className="mt-5" variant="outline" onClick={() => setSent(false)}>
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
      <form
        className="mt-5 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          setSent(true);
        }}
      >
        <label className="grid gap-2 text-sm font-semibold text-court-900">
          Type de demande
          <select defaultValue={defaultType} className="h-11 rounded-lg border border-court-200 bg-court-50 px-3 outline-none focus:border-court-500 focus:ring-2 focus:ring-court-500/20">
            <option>Séance d’essai</option>
            <option>Inscription</option>
            <option>Créneaux</option>
            <option>Volants</option>
            <option>Interclubs</option>
            <option>Autre</option>
          </select>
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-court-900">
            Nom
            <input required className="h-11 rounded-lg border border-court-200 bg-court-50 px-3 outline-none focus:border-court-500 focus:ring-2 focus:ring-court-500/20" />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-court-900">
            Email
            <input required type="email" className="h-11 rounded-lg border border-court-200 bg-court-50 px-3 outline-none focus:border-court-500 focus:ring-2 focus:ring-court-500/20" />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-semibold text-court-900">
          Message
          <textarea
            required
            rows={5}
            placeholder={messagePlaceholder ?? "Indiquez votre âge ou celui de votre enfant, votre niveau et vos disponibilités."}
            className="rounded-lg border border-court-200 bg-court-50 px-3 py-3 outline-none focus:border-court-500 focus:ring-2 focus:ring-court-500/20"
          />
        </label>
        <Button type="submit" className="w-full sm:w-fit">
          Envoyer ma demande
        </Button>
      </form>
    </Card>
  );
}
