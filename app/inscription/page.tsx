import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Download, FileCheck2, FileText, HeartPulse, MessageCircle, ShieldCheck, UserPlus } from "lucide-react";
import { HashAnchorScroller } from "@/components/public/hash-anchor-scroller";
import { HelloAssoRegistrationWidget } from "@/components/public/helloasso-registration-widget";
import { InteriorHero } from "@/components/public/interior-hero";
import { Card } from "@/components/ui/card";
import { getPublicClubSettings } from "@/services/club.service";

export const metadata: Metadata = {
  title: "Inscriptions et documents 2026-2027 - CFVV",
  description: "Inscription au CFVV et téléchargement des documents de licence et de santé FFBaD pour la saison 2026-2027."
};

const registrationDocuments = [
  { title: "Formulaire de licence adulte", description: "Formulaire FFBaD 2026-2027 à remplir en deux exemplaires.", href: "/documents/inscription-2026-2027/licence-ffbad-adulte-2026-2027.pdf" },
  { title: "Formulaire de licence mineur", description: "Formulaire FFBaD 2026-2027 avec les informations du représentant légal.", href: "/documents/inscription-2026-2027/licence-ffbad-mineur-2026-2027.pdf" },
  { title: "Questionnaire santé adulte", description: "Questionnaire fédéral à consulter avant de fournir, si nécessaire, un certificat médical.", href: "/documents/inscription-2026-2027/questionnaire-sante-adulte-ffbad.pdf" },
  { title: "Questionnaire santé mineur", description: "Questionnaire fédéral destiné au jeune licencié et à son représentant légal.", href: "/documents/inscription-2026-2027/questionnaire-sante-mineur-ffbad.pdf" },
  { title: "Certificat médical FFBaD", description: "Modèle officiel à faire compléter par un médecin lorsqu’un certificat est requis.", href: "/documents/inscription-2026-2027/certificat-medical-ffbad.pdf" }
];

export default async function InscriptionPage() {
  const settings = await getPublicClubSettings();
  const heroPhoto = settings.appearance.homeHeroImageUrl
    ? { id: "homeHero" as const, src: settings.appearance.homeHeroImageUrl, alt: "Joueurs du CFVV sur un terrain de badminton", width: 1400, height: 900 }
    : undefined;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <HashAnchorScroller />
      <InteriorHero
        contentKey="/inscription"
        eyebrow="Saison 2026-2027"
        title="Inscriptions et documents"
        intro="Retrouvez sur une seule page les étapes pour rejoindre le CFVV, les informations pratiques et tous les documents officiels à télécharger."
        tone="club"
        photo={heroPhoto}
        visualLabel="Rejoindre le CFVV"
        actions={[
          { href: "/creneaux", label: "Voir les créneaux", icon: <CalendarDays className="h-5 w-5" aria-hidden="true" /> },
          { href: "#adhesion", label: "Adhérer en ligne", icon: <UserPlus className="h-5 w-5" aria-hidden="true" /> },
          { href: "#documents", label: "Télécharger les documents", variant: "secondary", icon: <Download className="h-5 w-5" aria-hidden="true" /> }
        ]}
      />

      <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Étapes d'inscription">
        {[
          { title: "1. Choisir un créneau", text: "Consultez les jours, horaires et groupes pour trouver le créneau adapté.", href: "/creneaux", icon: CalendarDays },
          { title: "2. Faire une séance d’essai", text: "Jusqu’à trois séances d’essai sont possibles sur inscription préalable.", href: "/inscriptions/seance-essai", icon: HeartPulse },
          { title: "3. Préparer les documents", text: "Téléchargez ci-dessous le formulaire et les documents santé correspondant au licencié.", href: "#documents", icon: FileText },
          {
            title: "4. Finaliser l’adhésion",
            text: "Remplissez le formulaire d’adhésion et réglez en ligne de façon sécurisée avec HelloAsso.",
            href: "#adhesion",
            icon: UserPlus
          }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="flex flex-col p-5">
              <Icon className="h-6 w-6 text-court-500" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-black text-court-900">{item.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-ink-500">{item.text}</p>
              <Link href={item.href} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-court-600 hover:text-court-900">
                Continuer <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Card>
          );
        })}
      </section>

      <section id="adhesion" className="mt-12 scroll-mt-28" aria-labelledby="adhesion-title">
        <div className="mb-6 flex items-center gap-3">
          <UserPlus className="h-7 w-7 text-court-500" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-court-600">Saison 2026-2027</p>
            <h2 id="adhesion-title" className="text-3xl font-black text-court-900">Adhésion en ligne</h2>
          </div>
        </div>
        <HelloAssoRegistrationWidget />
      </section>

      <section id="documents" className="mt-12 scroll-mt-28" aria-labelledby="documents-title">
        <div className="flex items-center gap-3">
          <FileText className="h-7 w-7 text-court-500" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-court-600">Saison 2026-2027</p>
            <h2 id="documents-title" className="text-3xl font-black text-court-900">Documents à télécharger</h2>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {registrationDocuments.map((document) => (
            <Card key={document.href} className="flex flex-col p-6">
              <h3 className="text-lg font-black text-court-900">{document.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-ink-500">{document.description}</p>
              <a href={document.href} download className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-court-500 px-4 font-display text-sm font-bold text-white shadow-soft transition hover:bg-court-600">
                <Download className="h-4 w-4" aria-hidden="true" /> Télécharger le PDF
              </a>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <FileCheck2 className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-black text-court-900">Checklist avant inscription</h2>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-ink-500">
            <li>Choisir la formule jeune ou adulte correspondant à la pratique.</li>
            <li>Vérifier le créneau adapté à l’âge et au niveau du joueur.</li>
            <li>Préparer le questionnaire santé ou le certificat médical demandé.</li>
            <li>Pour un mineur, préparer les informations du responsable légal.</li>
          </ul>
        </Card>
        <Card className="p-6">
          <ShieldCheck className="h-6 w-6 text-info" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-black text-court-900">Besoin d’aide ?</h2>
          <p className="mt-3 leading-7 text-ink-500">Le bureau peut vous aider à choisir un créneau, vérifier les documents nécessaires ou préparer l’inscription d’un enfant.</p>
          <Link href="/contact" className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-court-500 px-5 font-semibold text-white hover:bg-court-600">
            <MessageCircle className="h-5 w-5" aria-hidden="true" /> Contacter le club
          </Link>
        </Card>
      </section>
    </main>
  );
}
