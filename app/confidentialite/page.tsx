import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Confidentialité - CF2V41",
  description: "Politique de confidentialité du site du Club des fous du Volant Vendômois.",
  alternates: canonical("/confidentialite")
};

const clubName = "CF2V41";
const contactEmail = "cfvv41@gmail.com";

const dataSections = [
  {
    title: "Compte adhérent",
    text: "Le site peut traiter les informations nécessaires à la création du compte : prénom, nom, email, téléphone si fourni, rôle dans le club et informations utiles à la gestion associative."
  },
  {
    title: "Réservations de créneaux",
    text: "Les réservations servent à organiser les créneaux, suivre les places disponibles et permettre aux responsables du club de gérer les inscriptions ou annulations."
  },
  {
    title: "Commandes de volants",
    text: "Les commandes ou mouvements de stock peuvent enregistrer l'adhérent concerné, le produit, la quantité, le statut et la date afin de suivre les achats ou retraits au club."
  },
  {
    title: "Formulaire de contact",
    text: "Les demandes envoyées via le formulaire peuvent contenir le nom, l'email, le téléphone si renseigné, le type de demande, le message et la date d'envoi."
  }
];

const rights = [
  "demander l'accès aux données qui vous concernent ;",
  "demander une correction si une information est inexacte ;",
  "demander la suppression ou l'anonymisation lorsque c'est possible ;",
  "demander des précisions sur l'utilisation de vos données par le club."
];

export default function ConfidentialitePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-lg border border-court-200 bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Données personnelles</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight text-court-900">Politique de confidentialité</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-ink-500">
          Le site du {clubName} limite les données collectées à la gestion du club, des demandes de contact,
          des réservations et des commandes de volants. Cette page doit être relue par le bureau avant validation finale.
        </p>
      </section>

      <Card className="mt-6 border-amber-200 bg-amber-50 p-5">
        <div className="flex gap-3">
          <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
          <div>
            <h2 className="font-black text-court-900">Information à finaliser</h2>
            <p className="mt-2 text-sm leading-6 text-ink-600">
              Les durées de conservation, les responsables internes et les procédures exactes de suppression doivent être
              validés par le bureau du club. Cette page n'affirme pas une conformité juridique complète.
            </p>
          </div>
        </div>
      </Card>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {dataSections.map((section) => (
          <Card key={section.title} className="p-5">
            <h2 className="text-xl font-black text-court-900">{section.title}</h2>
            <p className="mt-3 text-sm leading-6 text-ink-500">{section.text}</p>
          </Card>
        ))}
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-5">
          <h2 className="text-xl font-black text-court-900">Accès aux données</h2>
          <p className="mt-3 text-sm leading-6 text-ink-500">
            Les données personnelles ne doivent pas être affichées publiquement sans nécessité. Les responsables du club
            accèdent uniquement aux informations utiles à la gestion des adhérents, des créneaux et des demandes.
          </p>
          <p className="mt-4 text-sm leading-6 text-ink-500">
            Les listes d'inscrits, les informations de mineurs, les emails et les téléphones doivent rester réservés aux
            personnes autorisées par le club.
          </p>
        </Card>

        <Card className="p-5">
          <h2 className="text-xl font-black text-court-900">Durée de conservation</h2>
          <p className="mt-3 text-sm leading-6 text-ink-500">
            À compléter par le bureau : durée de conservation des comptes adhérents, réservations, commandes de volants,
            messages de contact, traces d'administration et documents internes.
          </p>
        </Card>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-xl font-black text-court-900">Vos droits RGPD</h2>
          <p className="mt-3 text-sm leading-6 text-ink-500">Vous pouvez contacter le club pour :</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-ink-500">
            {rights.map((right) => (
              <li key={right} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-court-500" aria-hidden="true" />
                <span>{right}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <h2 className="text-xl font-black text-court-900">Demande de suppression ou rectification</h2>
          <p className="mt-3 text-sm leading-6 text-ink-500">
            Pour demander une correction, une suppression ou une anonymisation, envoyez un message au club. Le bureau
            vérifiera la demande et les obligations de conservation liées à la vie associative.
          </p>
          <Link
            href={`mailto:${contactEmail}`}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-court-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-court-600"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            {contactEmail}
          </Link>
        </Card>
      </section>
    </div>
  );
}
