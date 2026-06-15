import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  FileText,
  HeartPulse,
  MessageCircle,
  UserPlus
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { getPublicClubSettings, getRegistrationLinkStatus } from "@/services/club.service";

export const metadata: Metadata = {
  title: "Inscription au club - CF2V41",
  description: "Étapes d'inscription, séance d'essai, tarifs et licence FFBaD du CF2V41."
};

export default async function InscriptionPage() {
  const settings = await getPublicClubSettings();
  const registration = getRegistrationLinkStatus(settings);
  const contactHref = settings.contact.email ? `mailto:${settings.contact.email}` : "/contact";

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-8 rounded-lg border border-court-200 bg-white p-6 shadow-soft lg:grid-cols-[1fr_380px]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Inscriptions</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight text-court-900">
            Rejoindre le {settings.club.name}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-ink-500">
            Tu veux rejoindre le club ? Commence par consulter les créneaux ou demander une séance d'essai.
            Le bureau confirme ensuite les documents utiles, le bon tarif et la licence à finaliser.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/creneaux"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-court-500 px-5 font-semibold text-white shadow-soft transition hover:bg-court-600"
            >
              Voir les créneaux
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/inscriptions/seance-essai"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-court-200 bg-white px-5 font-semibold text-court-900 transition hover:bg-court-50"
            >
              Demander une séance d'essai
            </Link>
            <Link
              href={registration.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-court-200 bg-white px-5 font-semibold text-court-900 transition hover:bg-court-50"
            >
              {registration.isFallback ? "Lien à confirmer" : "Finaliser l'inscription"}
              <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <aside className="rounded-lg bg-court-50 p-5">
          {registration.isFallback ? (
            <AlertTriangle className="h-6 w-6 text-orange-600" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="h-6 w-6 text-court-500" aria-hidden="true" />
          )}
          <h2 className="mt-4 text-2xl font-black text-court-900">Lien d'inscription</h2>
          <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-court-600">{registration.sourceLabel}</p>
          <p className="mt-3 text-sm leading-6 text-ink-500">{registration.confirmationMessage}</p>
          <p className="mt-4 rounded-lg bg-white px-4 py-3 text-sm leading-6 text-ink-600">
            En cas de doute, demande au club avant de finaliser la licence ou le paiement.
          </p>
        </aside>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "1. Choisir un créneau",
            text: "Regarde les jours, horaires, publics concernés et places disponibles.",
            href: "/creneaux",
            icon: CalendarDays
          },
          {
            title: "2. Essayer si besoin",
            text: "Jusqu'à 3 séances d'essai sont possibles sur inscription préalable.",
            href: "/inscriptions/seance-essai",
            icon: HeartPulse
          },
          {
            title: "3. Préparer les documents",
            text: "Questionnaire santé, certificat si nécessaire et autorisation parentale pour les mineurs.",
            href: "/inscriptions/documents-utiles",
            icon: FileText
          },
          {
            title: "4. Finaliser avec le club",
            text: "Le bureau confirme la formule, le tarif et le lien officiel d'inscription.",
            href: registration.url,
            icon: UserPlus,
            external: true
          }
        ].map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title} className="p-5">
              <Icon className="h-6 w-6 text-court-500" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-black text-court-900">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-ink-500">{item.text}</p>
              <Link
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noreferrer" : undefined}
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-court-600 hover:text-court-900"
              >
                Ouvrir
                {item.external ? <ExternalLink className="h-4 w-4" aria-hidden="true" /> : <ArrowRight className="h-4 w-4" aria-hidden="true" />}
              </Link>
            </Card>
          );
        })}
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6">
          <FileText className="h-6 w-6 text-info" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-black text-court-900">Documents à prévoir</h2>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-ink-500">
            <li>Questionnaire santé ou certificat médical selon les règles FFBaD en vigueur.</li>
            <li>Autorisation parentale et coordonnées du responsable légal pour les mineurs.</li>
            <li>Choix de la formule : loisirs, compétiteur, jeune loisir ou jeune compétiteur.</li>
            <li>Moyen de paiement ou justificatif si le club utilise une plateforme externe.</li>
          </ul>
          <p className="mt-4 rounded-lg bg-court-50 px-4 py-3 text-sm leading-6 text-ink-600">
            Les informations administratives peuvent évoluer selon la saison. La page d'inscription et les consignes du
            bureau font foi.
          </p>
        </Card>

        <Card className="p-6">
          <MessageCircle className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-black text-court-900">Besoin d'aide ?</h2>
          <p className="mt-3 leading-7 text-ink-500">
            Pas besoin d'être déjà bon : viens simplement avec une tenue de sport, on t'explique le reste.
            Pour un enfant, indique son âge et son niveau approximatif dans la demande.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-court-500 px-5 font-semibold text-white shadow-soft transition hover:bg-court-600"
            >
              Contacter le club
            </Link>
            <Link
              href={contactHref}
              className="inline-flex h-12 items-center justify-center rounded-lg border border-court-200 bg-white px-5 font-semibold text-court-900 transition hover:bg-court-50"
            >
              {settings.contact.email || "Page contact"}
            </Link>
          </div>
        </Card>
      </section>
    </main>
  );
}
