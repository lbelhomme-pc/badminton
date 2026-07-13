import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Mentions lÃ©gales - CFVV",
  description: "Mentions lÃ©gales du site du Club des fous du Volant VendÃ´mois.",
  alternates: canonical("/mentions-legales")
};

const clubName = "CFVV";
const clubFullName = "Club des fous du Volant VendÃ´mois";
const contactEmail = "cfvv41@gmail.com";

const sections = [
  {
    title: "Ã‰dition du site",
    items: [
      "Nom lÃ©gal de l'association : Ã  confirmer par le bureau.",
      "Nom utilisÃ© sur le site : Club des fous du Volant VendÃ´mois - CFVV.",
      "SiÃ¨ge social connu Ã  ce jour : Naveil. Adresse complÃ¨te Ã  complÃ©ter si le bureau souhaite l'afficher.",
      "Responsable de publication : bureau du CFVV, Ã  confirmer formellement."
    ]
  },
  {
    title: "HÃ©bergement",
    items: [
      "HÃ©bergeur technique pressenti : Vercel Inc.",
      "Adresse et informations lÃ©gales complÃ¨tes de l'hÃ©bergeur : Ã  vÃ©rifier et complÃ©ter depuis le compte de dÃ©ploiement.",
      "Le nom de domaine dÃ©finitif devra Ãªtre ajoutÃ© ici aprÃ¨s mise en production."
    ]
  },
  {
    title: "PropriÃ©tÃ© intellectuelle",
    items: [
      "Les textes, contenus, Ã©lÃ©ments graphiques, logo du club et documents publiÃ©s sur ce site sont destinÃ©s Ã  l'information des adhÃ©rents et visiteurs du club.",
      "Toute rÃ©utilisation du logo, des documents internes ou des contenus du site doit Ãªtre validÃ©e par le bureau du club.",
      "Les marques et services externes citÃ©s, comme FFBaD, MyFFBaD, Supabase ou Vercel, restent la propriÃ©tÃ© de leurs titulaires respectifs."
    ]
  },
  {
    title: "Photos, crÃ©dits et droit Ã  l'image",
    items: [
      "CrÃ©dits photos et illustrations : Ã  complÃ©ter par le club selon les visuels rÃ©ellement utilisÃ©s.",
      "Les photos de joueurs, bÃ©nÃ©voles, mineurs ou Ã©vÃ©nements ne doivent Ãªtre publiÃ©es qu'avec une autorisation adaptÃ©e.",
      "Toute demande de retrait d'une photo peut Ãªtre adressÃ©e au club via la page contact."
    ]
  }
];

export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-lg border border-court-200 bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Informations lÃ©gales</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight text-court-900">Mentions lÃ©gales</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-ink-500">
          Cette page rassemble les informations lÃ©gales du site du {clubName}. Certaines mentions doivent encore
          Ãªtre vÃ©rifiÃ©es par le bureau avant publication dÃ©finitive.
        </p>
      </section>

      <Card className="mt-6 border-amber-200 bg-amber-50 p-5">
        <div className="flex gap-3">
          <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
          <div>
            <h2 className="font-black text-court-900">Ã€ valider par le bureau</h2>
            <p className="mt-2 text-sm leading-6 text-ink-600">
              Ces mentions ne constituent pas une validation juridique complÃ¨te. Le club doit confirmer son nom lÃ©gal,
              son responsable de publication, l'hÃ©bergeur dÃ©finitif, les crÃ©dits photos et les rÃ¨gles de droit Ã  l'image.
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
          <h2 className="text-xl font-black text-court-900">Contact lÃ©gal</h2>
          <p className="mt-3 text-sm leading-6 text-ink-500">
            Pour une question liÃ©e au site, aux contenus publiÃ©s ou Ã  une demande de retrait, contactez le {clubFullName}.
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
          <h2 className="text-xl font-black text-court-900">Pages associÃ©es</h2>
          <div className="mt-4 grid gap-3 text-sm font-bold text-court-700">
            <Link href="/confidentialite" className="rounded-lg bg-court-50 px-4 py-3 hover:bg-court-100">
              Politique de confidentialitÃ©
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
