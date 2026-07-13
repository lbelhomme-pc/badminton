import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Confidentialité - CFVV",
  description: "Politique de confidentialité du site du Club des Fous du Volant du Vendômois.",
  alternates: canonical("/confidentialite")
};

const clubName = "Club des Fous du Volant du Vendômois - CFVV";
const contactEmail = "cfvv41@gmail.com";

const treatments = [
  {
    title: "Comptes adhérents",
    purpose: "Créer et gérer les accès à l'espace adhérent.",
    data: "Nom, prénom, email, téléphone si fourni, licence, statut de saison, rôle.",
    legalBase: "À valider par le bureau : contrat associatif, intérêt légitime ou obligation fédérale selon le cas.",
    retention: "À valider par le bureau : durée active de la saison puis archivage ou anonymisation."
  },
  {
    title: "Réservations de créneaux",
    purpose: "Organiser les séances, capacités, annulations et listes d'attente.",
    data: "Identifiant adhérent, créneau, date, statut, historique minimal.",
    legalBase: "À valider par le bureau : exécution du service demandé par l'adhérent.",
    retention: "À valider par le bureau : durée utile sportive puis anonymisation statistique."
  },
  {
    title: "Boutique volants",
    purpose: "Présenter les produits et orienter vers HelloAsso pour le paiement.",
    data: "Historique interne éventuel de commande ou retrait ; aucune donnée bancaire sur le site CFVV.",
    legalBase: "À valider par le bureau : gestion associative et exécution du service demandé.",
    retention: "À valider par le bureau : durée comptable ou associative applicable."
  },
  {
    title: "Formulaire de contact",
    purpose: "Répondre aux demandes d'essai, inscription, partenariat ou information.",
    data: "Nom, email, téléphone optionnel, objet, message, date d'envoi.",
    legalBase: "À valider par le bureau : consentement ou intérêt légitime de réponse.",
    retention: "À valider par le bureau : suppression après traitement ou archivage limité."
  },
  {
    title: "Documents privés",
    purpose: "Mettre à disposition des documents internes aux adhérents ou responsables autorisés.",
    data: "Métadonnées du document, rôles autorisés, éventuels liens temporaires de téléchargement.",
    legalBase: "À valider par le bureau : gestion de la vie associative.",
    retention: "À valider document par document selon son intérêt associatif."
  }
];

const processors = [
  "Supabase : authentification, base de données, stockage privé.",
  "Vercel : hébergement du site.",
  "HelloAsso : paiement des produits ou cotisations lorsque le club utilise un lien officiel.",
  "GitHub : hébergement du code source, sans données adhérents en principe."
];

const rights = [
  "droit d'accès aux données vous concernant ;",
  "droit de rectification ;",
  "droit à l'effacement lorsque la conservation n'est plus nécessaire ;",
  "droit à la limitation du traitement ;",
  "droit d'opposition selon la base légale retenue ;",
  "droit de retirer un consentement lorsque le traitement repose sur celui-ci."
];

export default function ConfidentialitePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-lg border border-court-200 bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Données personnelles</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight text-court-900">Politique de confidentialité</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-ink-500">
          Cette page décrit les traitements liés au site du {clubName}. Elle distingue les éléments techniques déjà en place des points à valider
          juridiquement par le bureau du club.
        </p>
      </section>

      <Card className="mt-6 border-amber-200 bg-amber-50 p-5">
        <div className="flex gap-3">
          <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
          <div>
            <h2 className="font-black text-court-900">Validation indispensable</h2>
            <p className="mt-2 text-sm leading-6 text-ink-600">
              Le responsable de traitement, les bases légales et les durées de conservation définitives doivent être validés par le bureau. Cette page
              ne remplace pas un avis juridique.
            </p>
          </div>
        </div>
      </Card>

      <section className="mt-8 grid gap-4">
        {treatments.map((item) => (
          <Card key={item.title} className="p-5">
            <h2 className="text-xl font-black text-court-900">{item.title}</h2>
            <dl className="mt-4 grid gap-3 text-sm leading-6 text-ink-600 md:grid-cols-2">
              <div>
                <dt className="font-black text-court-900">Finalité</dt>
                <dd>{item.purpose}</dd>
              </div>
              <div>
                <dt className="font-black text-court-900">Données</dt>
                <dd>{item.data}</dd>
              </div>
              <div>
                <dt className="font-black text-court-900">Base légale</dt>
                <dd>{item.legalBase}</dd>
              </div>
              <div>
                <dt className="font-black text-court-900">Conservation</dt>
                <dd>{item.retention}</dd>
              </div>
            </dl>
          </Card>
        ))}
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-xl font-black text-court-900">Vos droits</h2>
          <p className="mt-3 text-sm leading-6 text-ink-500">
            Vous pouvez contacter le club pour exercer les droits suivants, dans les limites prévues par le RGPD et les obligations associatives :
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-ink-500">
            {rights.map((right) => (
              <li key={right} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-court-500" aria-hidden="true" />
                <span>{right}</span>
              </li>
            ))}
          </ul>
          <Link
            href={`mailto:${contactEmail}`}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-court-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-court-600"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            {contactEmail}
          </Link>
        </Card>

        <Card className="p-5">
          <h2 className="text-xl font-black text-court-900">Sous-traitants et services tiers</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-ink-500">
            {processors.map((processor) => (
              <li key={processor} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-court-500" aria-hidden="true" />
                <span>{processor}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <h2 className="text-xl font-black text-court-900">Mineurs et droit à l'image</h2>
          <p className="mt-3 text-sm leading-6 text-ink-500">
            Les informations concernant les mineurs doivent être limitées à la gestion sportive et administrative. Les photos de mineurs ne doivent
            être publiées qu'après validation du droit à l'image par le club et les représentants légaux.
          </p>
        </Card>

        <Card className="p-5">
          <h2 className="text-xl font-black text-court-900">Suppression et anonymisation</h2>
          <p className="mt-3 text-sm leading-6 text-ink-500">
            Quand une suppression complète n'est pas possible pour des raisons de preuve, de comptabilité ou de sécurité, le club doit privilégier
            l'archivage limité ou l'anonymisation.
          </p>
        </Card>
      </section>
    </div>
  );
}
