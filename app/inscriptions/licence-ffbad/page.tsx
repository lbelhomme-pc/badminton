import Link from "next/link";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { InfoPage } from "@/components/public/info-page";
import { getPublicClubSettings, getRegistrationLinkStatus } from "@/services/club.service";

export default async function LicenceFfbadPage() {
  const settings = await getPublicClubSettings();
  const registration = getRegistrationLinkStatus(settings);

  return (
    <InfoPage
      contentKey="/inscriptions/licence-ffbad"
      eyebrow="Inscriptions"
      title="Licence FFBaD"
      intro={`La licence rattache le joueur au ${settings.club.name} et ouvre l'accès aux créneaux, à l'assurance fédérale et aux compétitions selon la formule choisie.`}
      cards={[
        { title: "Parcours club", text: "Consulte les créneaux, vérifie le tarif, puis contacte le club ou demande un essai si tu hésites.", href: "/inscription" },
        { title: "Compétition", text: "Les joueurs qui souhaitent faire des tournois ou interclubs doivent vérifier la formule adaptée." },
        { title: "Documents", text: "Questionnaire santé, certificat si nécessaire et autorisation parentale sont préparés avant validation.", href: "/inscriptions/documents-utiles" }
      ]}
    >
      <div className="rounded-lg border border-court-200 bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-court-600">{registration.sourceLabel}</p>
            <h2 className="mt-2 text-2xl font-black text-court-900">Lien d'inscription FFBaD</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-500">{registration.confirmationMessage}</p>
          </div>
          {registration.isFallback ? <AlertTriangle className="h-6 w-6 shrink-0 text-orange-600" aria-hidden="true" /> : null}
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            href={registration.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-court-500 px-5 font-semibold text-white shadow-soft transition hover:bg-court-600"
          >
            {registration.isFallback ? "Lien FFBaD à confirmer" : `S'inscrire via FFBaD / Poona`}
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-court-200 bg-white px-5 font-semibold text-court-900 transition hover:bg-court-50"
          >
            Demander confirmation au club
          </Link>
        </div>
      </div>
    </InfoPage>
  );
}
