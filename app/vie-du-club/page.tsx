import type { Metadata } from "next";
import { InfoPage } from "@/components/public/info-page";

export const metadata: Metadata = {
  title: "Vie du club - CFVV",
  description: "Actualités, événements, interclubs et tournois du CFVV."
};

export default function VieDuClubPage() {
  return (
    <InfoPage
      contentKey="/vie-du-club"
      eyebrow="Vie du club"
      title="Actualités, événements et compétitions"
      intro="La vie du CFVV ne se limite pas aux créneaux : événements, interclubs, tournois et bénévoles rythment la saison."
      cards={[
        { title: "Actualités", text: "Fermetures, annonces, résultats et informations importantes.", href: "/vie-du-club/actualites" },
        { title: "Événements", text: "Stages, rencontres internes, moments conviviaux et actions club.", href: "/vie-du-club/evenements" },
        { title: "Interclubs", text: "Équipes, prochaines rencontres, capitaines et résultats.", href: "/vie-du-club/interclubs" },
        { title: "Tournois", text: "Tournois internes, sorties compétition et inscriptions.", href: "/vie-du-club/tournois" },
        { title: "Partenaires", text: "Entreprises, collectivités et structures locales qui souhaitent échanger avec le club.", href: "/vie-du-club/partenaires" }
      ]}
    />
  );
}
