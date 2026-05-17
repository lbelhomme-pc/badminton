import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { InfoPage } from "@/components/public/info-page";
import { getPublicClubSettings } from "@/services/club.service";

export default async function LicenceFfbadPage() {
  const settings = await getPublicClubSettings();
  const registrationUrl = settings.club.ffbadUrl;

  return (
    <InfoPage
      eyebrow="Inscriptions"
      title="Licence FFBaD"
      intro={`La licence rattache le joueur au ${settings.club.name} et ouvre l’accès aux créneaux, à l’assurance fédérale et aux compétitions selon la formule choisie.`}
      cards={[
        { title: "Inscription officielle", text: "Le club centralise les consignes et documents sur sa page d’inscription.", href: registrationUrl },
        { title: "Compétition", text: "Les joueurs qui souhaitent faire des tournois ou interclubs doivent vérifier la formule adaptée." },
        { title: "Documents", text: "Questionnaire santé, certificat si nécessaire et autorisation parentale sont préparés avant validation." }
      ]}
    >
      <Link
        href={registrationUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-12 items-center gap-2 rounded-lg bg-court-500 px-5 font-semibold text-white shadow-soft"
      >
        Ouvrir l’inscription officielle {settings.club.name}
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
      </Link>
    </InfoPage>
  );
}
