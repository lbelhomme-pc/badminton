import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ExternalLink, FileText, HeartPulse, UserPlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getFfbadRegistrationUrl } from "@/services/club.service";

export const metadata: Metadata = {
  title: "Inscription au club - CFVV41",
  description: "Étapes d'inscription, séance d'essai, tarifs et licence FFBaD du CFVV41."
};

export default function InscriptionPage() {
  const registrationUrl = getFfbadRegistrationUrl();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-8 rounded-lg border border-court-200 bg-white p-6 shadow-soft lg:grid-cols-[1fr_360px]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Inscriptions</p>
          <h1 className="mt-3 text-4xl font-black text-court-900">Rejoindre le CFVV41</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-500">
            Tu veux rejoindre le club ? Commence par consulter les créneaux, puis crée ton compte ou demande une séance
            d'essai. Le club te recontactera si besoin pour finaliser ton inscription et ta licence.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/creation-compte"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-court-500 px-5 font-semibold text-white shadow-soft transition hover:bg-court-600"
            >
              <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
              Créer mon compte
            </Link>
            <Link
              href="/inscriptions/seance-essai"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-court-200 bg-white px-5 font-semibold text-court-900 transition hover:bg-court-100"
            >
              Demander un essai
            </Link>
            <Link
              href={registrationUrl}
              target="_blank"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-court-200 bg-white px-5 font-semibold text-court-900 transition hover:bg-court-100"
            >
              Licence FFBaD
              <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="rounded-lg bg-court-100 p-5">
          <p className="font-black text-court-900">3 séances d'essai possibles</p>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Idéal pour trouver le bon créneau, découvrir l'ambiance et vérifier le matériel nécessaire.
          </p>
          <Link href="/contact" className="mt-4 inline-flex text-sm font-black text-court-600 hover:text-court-900">
            Contacter le club
          </Link>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-4">
        {[
          ["Voir les créneaux", "Repère les horaires adaptés à ton âge, ton niveau et tes disponibilités.", "/creneaux"],
          ["Venir essayer", "Jusqu'à 3 séances d'essai sur inscription préalable.", "/inscriptions/seance-essai"],
          ["Préparer les documents", "Questionnaire santé, certificat si nécessaire et autorisation parentale.", "/inscriptions/documents-utiles"],
          ["Finaliser la licence", "Le lien FFBaD ou HelloAsso est configurable par les responsables.", registrationUrl]
        ].map(([title, text, href], index) => (
          <Card key={title} className="p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-court-900 text-sm font-black text-shuttle">
              {index + 1}
            </span>
            <h2 className="mt-4 text-lg font-black text-court-900">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-500">{text}</p>
            <Link href={href} className="mt-4 inline-flex text-sm font-black text-court-600 hover:text-court-900">
              Ouvrir
            </Link>
          </Card>
        ))}
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <CheckCircle2 className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-black text-court-900">Pour qui ?</h2>
          <div className="mt-4 grid gap-3">
            {[
              ["Jeunes", "Groupes encadrés selon âge et niveau."],
              ["Adultes débutants", "Accueil progressif, prêt de raquette possible pour l'essai."],
              ["Loisirs", "Jeu libre sans obligation de compétition."],
              ["Compétiteurs", "Créneaux et interclubs selon les places disponibles."]
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-court-50 px-4 py-3">
                <p className="font-semibold text-court-900">{label}</p>
                <p className="mt-1 text-sm text-ink-500">{value}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <FileText className="h-6 w-6 text-info" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-black text-court-900">Documents et confidentialité</h2>
          <p className="mt-4 text-sm leading-6 text-ink-500">
            Le club limite les informations collectées à la gestion des adhérents, des réservations et des messages utiles.
            Les données des mineurs ne sont pas affichées publiquement.
          </p>
          <p className="mt-4 flex gap-2 text-sm leading-6 text-ink-500">
            <HeartPulse className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
            Les documents médicaux suivent les règles FFBaD et ne doivent pas être rendus publics sur le site.
          </p>
        </Card>
      </section>
    </main>
  );
}
