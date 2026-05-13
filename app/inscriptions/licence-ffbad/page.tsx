import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { InfoPage } from "@/components/public/info-page";
import { getFfbadRegistrationUrl } from "@/services/club.service";

export default function LicenceFfbadPage() {
  return (
    <InfoPage
      eyebrow="Inscriptions"
      title="Licence FFBaD"
      intro="La licence rattache le joueur au CFVV41 et ouvre l’accès aux créneaux, à l’assurance fédérale et aux compétitions selon la formule choisie."
      cards={[
        { title: "Inscription officielle", text: "Le club centralise les consignes et documents sur sa page d’inscription.", href: getFfbadRegistrationUrl() },
        { title: "Compétition", text: "Les joueurs qui souhaitent faire des tournois ou interclubs doivent vérifier la formule adaptée." },
        { title: "Documents", text: "Questionnaire santé, certificat si nécessaire et autorisation parentale sont préparés avant validation." }
      ]}
    >
      <Link
        href={getFfbadRegistrationUrl()}
        target="_blank"
        className="inline-flex h-12 items-center gap-2 rounded-lg bg-court-500 px-5 font-semibold text-white shadow-soft"
      >
        Ouvrir l’inscription officielle CFVV41
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
      </Link>
    </InfoPage>
  );
}
