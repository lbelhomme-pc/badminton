"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { lookupMemberLicence, type LicenceLookupResult } from "@/services/supabase-data.service";

const publicSignupEnabled = process.env.NEXT_PUBLIC_ENABLE_PUBLIC_SIGNUP === "true";

export function SignupForm() {
  if (!publicSignupEnabled) {
    return <LicenceActivationSignupForm />;
  }

  return <TransitionSignupForm />;
}

function LicenceActivationSignupForm() {
  const { signup, configured } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    licence: "",
    email: "",
    password: "",
    confirmPassword: "",
    privacy: false
  });
  const [checkedLicence, setCheckedLicence] = useState("");
  const [member, setMember] = useState<LicenceLookupResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [checking, setChecking] = useState(false);

  function update(field: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
    if (field === "licence") {
      setCheckedLicence("");
      setMember(null);
    }
  }

  async function checkLicence() {
    const licence = form.licence.trim();
    if (!licence) {
      setMessage("Indique ton numéro de licence FFBaD.");
      return null;
    }

    setChecking(true);
    setMessage(null);
    const result = await lookupMemberLicence(licence);
    setChecking(false);

    if (result.error || !result.data) {
      setMember(null);
      setCheckedLicence("");
      setMessage(result.error ?? "Licence introuvable. Contacte le club si tu penses qu'elle devrait être active.");
      return null;
    }

    setMember(result.data);
    setCheckedLicence(licence);
    setMessage(result.data.message);
    return result.data;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!form.privacy) {
      setMessage("Merci d'accepter les informations de confidentialité.");
      return;
    }

    let activeMember = checkedLicence === form.licence.trim() ? member : null;
    if (!activeMember) {
      activeMember = await checkLicence();
    }

    if (!activeMember?.found || !activeMember.available) {
      setMessage(activeMember?.message ?? "Cette licence ne permet pas encore de créer un compte.");
      return;
    }

    setPending(true);
    const result = await signup({
      prenom: activeMember.prenom ?? "",
      nom: activeMember.nom ?? "",
      email: form.email,
      telephone: "",
      password: form.password,
      categorie: activeMember.categorie,
      licence_ffbad: activeMember.licence_ffbad
    });

    if (result.ok && result.signedIn) {
      setMessage("Connexion en cours...");
      router.replace("/espace-adherent");
      return;
    }

    setMessage(result.message);
    setPending(false);
  }

  return (
    <Card className="mx-auto max-w-2xl p-6">
      <p className="font-display text-sm font-bold uppercase text-court-600">Activation adhérent</p>
      <h2 className="mt-2 text-3xl font-black text-court-900">Créer mon compte avec ma licence</h2>
      <p className="mt-3 text-sm leading-6 text-ink-600">
        Saisis ton numéro de licence FFBaD. S'il est présent dans la liste validée par le club, tu pourras créer ton compte avec ton email et ton mot de passe.
      </p>
      {!configured ? (
        <p className="mt-4 rounded-lg bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700">
          La création de compte n'est pas encore disponible. Réessaie plus tard ou contacte le club.
        </p>
      ) : null}
      <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <TextInput label="Numéro de licence FFBaD" autoComplete="off" value={form.licence} onChange={(value) => update("licence", value)} />
          <Button type="button" variant="outline" disabled={checking || !configured} onClick={checkLicence}>
            {checking ? "Vérification..." : "Vérifier"}
          </Button>
        </div>
        {member?.found ? (
          <div className={`rounded-lg px-4 py-3 text-sm leading-6 ${member.available ? "bg-court-50 text-court-900" : "bg-orange-50 text-orange-800"}`}>
            <p className="font-black">
              {member.prenom} {member.nom}
            </p>
            <p>
              Licence {member.licence_ffbad}
              {member.categorie ? ` · ${member.categorie}` : ""}
            </p>
            <p className="mt-1 font-semibold">{member.message}</p>
          </div>
        ) : null}
        <TextInput label="Email" type="email" autoComplete="email" value={form.email} onChange={(value) => update("email", value)} />
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="Mot de passe" type="password" autoComplete="new-password" value={form.password} onChange={(value) => update("password", value)} />
          <TextInput label="Confirmation" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={(value) => update("confirmPassword", value)} />
        </div>
        <label className="flex gap-3 rounded-lg bg-court-100 p-3 text-sm leading-6 text-ink-600">
          <input
            type="checkbox"
            checked={form.privacy}
            onChange={(event) => update("privacy", event.target.checked)}
            className="mt-1 h-4 w-4"
          />
          <span>
            J'ai compris que mes données servent à gérer mon compte adhérent, mes réservations et les échanges avec le club. Je peux demander leur suppression
            via la page contact.
          </span>
        </label>
        {message ? (
          <p role="status" aria-live="polite" className="rounded-lg bg-court-100 px-3 py-2 text-sm font-semibold text-court-900">
            {message}
          </p>
        ) : null}
        <Button type="submit" disabled={pending || checking || !configured}>
          {pending ? "Création..." : "Créer mon compte adhérent"}
        </Button>
      </form>
      <p className="mt-5 text-sm text-ink-500">
        Déjà un compte ?{" "}
        <Link href="/connexion" className="font-bold text-court-600">
          Connexion
        </Link>
      </p>
    </Card>
  );
}

function TransitionSignupForm() {
  const { signup, configured } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    password: "",
    confirmPassword: "",
    privacy: false
  });
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function update(field: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!form.privacy) {
      setMessage("Merci d'accepter les informations de confidentialité.");
      return;
    }

    setPending(true);
    const result = await signup({
      prenom: form.prenom,
      nom: form.nom,
      email: form.email,
      telephone: form.telephone,
      password: form.password
    });

    if (result.ok && result.signedIn) {
      setMessage("Connexion en cours...");
      router.replace("/espace-adherent");
      return;
    }

    setMessage(result.message);
    setPending(false);
  }

  return (
    <Card className="mx-auto max-w-2xl p-6">
      <p className="font-display text-sm font-bold uppercase text-yellow-700">Mode transition</p>
      <h2 className="mt-2 text-3xl font-black text-court-900">Créer un compte</h2>
      <p className="mt-2 text-sm leading-6 text-ink-500">
        Cette création libre ne doit rester active que pendant une phase de transition. Le fonctionnement cible du CFVV est l'activation par invitation.
      </p>
      {!configured ? (
        <p className="mt-4 rounded-lg bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700">
          La création de compte n'est pas encore disponible. Réessaie plus tard ou contacte le club.
        </p>
      ) : null}
      <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="Prénom" autoComplete="given-name" value={form.prenom} onChange={(value) => update("prenom", value)} />
          <TextInput label="Nom" autoComplete="family-name" value={form.nom} onChange={(value) => update("nom", value)} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="Email" type="email" autoComplete="email" value={form.email} onChange={(value) => update("email", value)} />
          <TextInput label="Téléphone" type="tel" autoComplete="tel" value={form.telephone} onChange={(value) => update("telephone", value)} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="Mot de passe" type="password" autoComplete="new-password" value={form.password} onChange={(value) => update("password", value)} />
          <TextInput label="Confirmation" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={(value) => update("confirmPassword", value)} />
        </div>
        <label className="flex gap-3 rounded-lg bg-court-100 p-3 text-sm leading-6 text-ink-600">
          <input
            type="checkbox"
            checked={form.privacy}
            onChange={(event) => update("privacy", event.target.checked)}
            className="mt-1 h-4 w-4"
          />
          <span>
            J'ai compris que mes données servent à gérer mon compte, mes réservations et les échanges avec le club. Je peux demander leur suppression
            via la page contact.
          </span>
        </label>
        {message ? (
          <p role="status" aria-live="polite" className="rounded-lg bg-court-100 px-3 py-2 text-sm font-semibold text-court-900">
            {message}
          </p>
        ) : null}
        <Button type="submit" disabled={pending || !configured}>
          {pending ? "Création..." : "Créer mon compte"}
        </Button>
      </form>
      <p className="mt-5 text-sm text-ink-500">
        Déjà un compte ?{" "}
        <Link href="/connexion" className="font-bold text-court-600">
          Connexion
        </Link>
      </p>
    </Card>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = "text",
  autoComplete
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-court-900">
      {label}
      <input
        required
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-lg border border-court-200 bg-court-50 px-3 outline-none focus:border-court-500 focus:ring-2 focus:ring-court-500/20"
      />
    </label>
  );
}
