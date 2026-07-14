import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Mentions légales - CFVV",
  description: "Mentions légales du site du Club des fous du Volants Vendômois.",
  alternates: canonical("/mentions-legales")
};

const clubName = "CFVV";
const clubFullName = "Club des fous du Volants Vendômois";
const contactEmail = "cfvv41@gmail.com";

const sections = [
  {
    title: "Édition du site",
    items: [
      `Nom utilisé sur le site : ${clubFullName} - CFVV.`,
      "Siège social confirmé : 10 Imp. de la Devallerie, 41100 Naveil.",
      "Lieu de pratique confirmé : Gymnase des Aigremonts, 554 Rue de la Chappe, 41100 Vendôme.",
      "Contact public : cfvv41@gmail.com - 06 60 93 51 85.",
      "Référents contact : Clovis Bellan, Didier Remule et Julie Remule.",
      "Responsable de publication : bureau du CFVV, à confirmer formellement."
    ]
  },
  {
    title: "Hébergement",
    items: [
      "Hébergeur technique pressenti : Vercel Inc.",
      "Adresse et informations légales complètes de l'hébergeur : à vérifier et compléter depuis le compte de déploiement.",
      "Le nom de domaine définitif devra être ajouté ici après mise en production."
    ]
  },
  {
    title: "Propriété intellectuelle",
    items: [
      "Les textes, contenus, éléments graphiques, logo du club et documents publiés sur ce site sont destinés à l'information des adhérents et visiteurs du club.",
      "Toute réutilisation du logo, des documents internes ou des contenus du site doit être validée par le bureau du club.",
      "Les marques et services externes cités, comme FFBaD, MyFFBaD, Supabase ou Vercel, restent la propriété de leurs titulaires respectifs."
    ]
  },
  {
    title: "Photos, crédits et droit à l'image",
    items: [
      "Crédits photos et illustrations : à compléter par le club selon les visuels réellement utilisés.",
      "Les photos de joueurs, bénévoles, mineurs ou événements ne doivent être publiées qu'avec une autorisation adaptée.",
      "Toute demande de retrait d'une photo peut être adressée au club via la page contact."
    ]
  }
];

export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-lg border border-court-200 bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Informations légales</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight text-court-900">Mentions légales</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-ink-500">
          Cette page rassemble les informations légales du site du {clubName}. Certaines mentions doivent encore
          être vérifiées par le bureau avant publication définitive.
        </p>
      </section>

      <Card className="mt-6 border-amber-200 bg-amber-50 p-5">
        <div className="flex gap-3">
          <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
          <div>
            <h2 className="font-black text-court-900">À valider par le bureau</h2>
            <p className="mt-2 text-sm leading-6 text-ink-600">
              Ces mentions ne constituent pas une validation juridique complète. Le club doit confirmer son responsable de publication,
              l'hébergeur définitif, les crédits photos et les règles de droit à l'image.
            </p>
          </div>
        </div>
      </Card>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title} className="p-5">
            <h2 className="text-xl font-black text-court-900">{section.title}</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-ink-500">
              {section.items.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-court-500" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-xl font-black text-court-900">Contact légal</h2>
          <p className="mt-3 text-sm leading-6 text-ink-500">
            Pour une question liée au site, aux contenus publiés ou à une demande de retrait, contactez le {clubFullName}.
          </p>
          <Link
            href={`mailto:${contactEmail}`}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-court-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-court-600"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            {contactEmail}
          </Link>
        </Card>

        <Card className="p-5">
          <h2 className="text-xl font-black text-court-900">Pages associées</h2>
          <div className="mt-4 grid gap-3 text-sm font-bold text-court-700">
            <Link href="/confidentialite" className="rounded-lg bg-court-50 px-4 py-3 hover:bg-court-100">
              Politique de confidentialité
            </Link>
            <Link href="/contact" className="rounded-lg bg-court-50 px-4 py-3 hover:bg-court-100">
              Formulaire de contact
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
