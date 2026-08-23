import type { Metadata } from "next";
import { ActualitesList } from "@/components/public/actualites-list";
import { InfoPage } from "@/components/public/info-page";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Actualités - CFVV",
  description: "Actualités et annonces du Club des fous du Volants Vendômois.",
  alternates: canonical("/vie-du-club/actualites")
};

export default function ActualitesPage() {
  return (
    <InfoPage
      contentKey="/vie-du-club/actualites"
      eyebrow="Vie du club"
      title="Actualités"
      intro="Les dernières informations utiles du club : planning, bénévoles, événements et annonces."
      cards={[]}
    >
      <ActualitesList />
    </InfoPage>
  );
}
