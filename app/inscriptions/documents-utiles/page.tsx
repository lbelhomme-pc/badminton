import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Download, FileCheck2, FileText, HeartPulse, ShieldCheck, UserRoundCheck } from "lucide-react";
import { InfoPage } from "@/components/public/info-page";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Documents d'inscription 2026-2027 - CFVV",
  description: "Téléchargez les formulaires de licence et documents de santé FFBaD pour la saison 2026-2027."
};

const registrationDocuments = [
  {
    title: "Formulaire de licence adulte",
    description: "Formulaire FFBaD 2026-2027 à remplir en deux exemplaires.",
    href: "/documents/inscription-2026-2027/licence-ffbad-adulte-2026-2027.pdf"
  },
  {
    title: "Formulaire de licence mineur",
    description: "Formulaire FFBaD 2026-2027 avec les informations du représentant légal.",
    href: "/documents/inscription-2026-2027/licence-ffbad-mineur-2026-2027.pdf"
  },
  {
    title: "Questionnaire santé adulte",
    description: "Questionnaire fédéral à consulter avant de fournir, si nécessaire, un certificat médical.",
    href: "/documents/inscription-2026-2027/questionnaire-sante-adulte-ffbad.pdf"
  },
  {
    title: "Questionnaire santé mineur",
    description: "Questionnaire fédéral destiné au jeune licencié et à son représentant légal.",
    href: "/documents/inscription-2026-2027/questionnaire-sante-mineur-ffbad.pdf"
  },
  {
    title: "Certificat médical FFBaD",
    description: "Modèle officiel de certificat de non-contre-indication à faire compléter par un médecin lorsqu'il est requis.",
    href: "/documents/inscription-2026-2027/certificat-medical-ffbad.pdf"
  }
];

export default function DocumentsUtilesPage() {
  return (
    <InfoPage
      eyebrow="Inscriptions"
      title="Documents d'inscription 2026-2027"
      intro="Téléchargez les formulaires officiels nécessaires pour préparer votre inscription adulte ou mineur au CFVV pour la saison 2026-2027."
      cards={[
        { title: "Règlement intérieur", text: "Règles de vie, accès aux créneaux, sécurité, annulations et respect du matériel." },
        { title: "Santé", text: "Questionnaire santé ou certificat médical selon votre situation et les règles fédérales en vigueur." },
        { title: "Mineurs", text: "Autorisation parentale et coordonnées du responsable légal si nécessaire." }
      ]}
    >
      <section aria-labelledby="documents-telecharger">
        <div className="flex items-center gap-3">
          <FileText className="h-7 w-7 text-court-500" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-court-600">Saison 2026-2027</p>
            <h2 id="documents-telecharger" className="text-2xl font-black text-court-900">
              Documents à télécharger
            </h2>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {registrationDocuments.map((document) => (
            <Card key={document.href} className="flex flex-col p-6">
              <h3 className="text-lg font-black text-court-900">{document.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-ink-500">{document.description}</p>
              <a
                href={document.href}
                download
                className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-court-500 px-4 font-display text-sm font-bold text-white shadow-soft transition hover:bg-court-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-court-500 focus-visible:ring-offset-2"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Télécharger le PDF
              </a>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <FileCheck2 className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-black text-court-900">Checklist avant inscription</h2>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-ink-500">
            <li>Choisir la formule : adulte loisir, adulte compétiteur, enfant loisir ou enfant compétiteur.</li>
            <li>Vérifier le créneau adapté au niveau et à l'âge du joueur.</li>
            <li>Préparer les documents santé demandés par la fédération.</li>
            <li>Pour un mineur, prévoir les informations du responsable légal.</li>
            <li>Contacter le club si le lien d'inscription officiel n'est pas encore confirmé.</li>
          </ul>
        </Card>

        <Card className="p-6">
          <ShieldCheck className="h-6 w-6 text-info" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-black text-court-900">À valider par le bureau</h2>
          <div className="mt-4 grid gap-3 text-sm leading-6 text-ink-500">
            <p className="flex gap-2">
              <HeartPulse className="mt-0.5 h-4 w-4 shrink-0 text-court-500" aria-hidden="true" />
              Les règles médicales applicables à la saison en cours.
            </p>
            <p className="flex gap-2">
              <UserRoundCheck className="mt-0.5 h-4 w-4 shrink-0 text-court-500" aria-hidden="true" />
              L'âge minimum d'accueil des jeunes et les groupes disponibles.
            </p>
            <p className="rounded-lg bg-court-50 px-4 py-3">
              Si vous avez un doute, utilisez le formulaire de contact avant de créer ou finaliser l'inscription.
            </p>
          </div>
          <Link className="mt-5 inline-flex font-bold text-court-600 hover:text-court-900" href="/contact">
            Poser une question au club
          </Link>
        </Card>
      </div>

      <Card className="p-6">
        <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-court-600">Affiliation fédérale</p>
            <h2 className="mt-2 text-2xl font-black text-court-900">Labels FFBaD 2026-2027</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-500">
              Le club s'inscrit dans le parcours fédéral et l'École française de badminton pour la saison 2026-2027.
            </p>
          </div>
          <div className="flex items-center justify-center gap-4 rounded-lg bg-[#202e78] p-4">
            <Image src="/images/labels/efb-saison-2026-2027.jpg" alt="École française de badminton, saison 2026-2027" width={148} height={200} className="h-28 w-auto" />
            <Image src="/images/labels/ffbad-efb-saison-2026-2027.jpg" alt="FFBaD et École française de badminton, saison 2026-2027" width={310} height={200} className="h-28 w-auto" />
          </div>
        </div>
      </Card>
    </InfoPage>
  );
}
