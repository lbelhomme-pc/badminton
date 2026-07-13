import type { Metadata } from "next";
import { InfoPage } from "@/components/public/info-page";
import { ActualitesList } from "@/components/public/actualites-list";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "ActualitÃ©s - CFVV",
  description: "ActualitÃ©s et annonces du Club des fous du Volant VendÃ´mois.",
  alternates: canonical("/vie-du-club/actualites")
};

export default function ActualitesPage() {
  return (
    <InfoPage
      eyebrow="Vie du club"
      title="ActualitÃ©s"
      intro="Les derniÃ¨res informations utiles du club : planning, bÃ©nÃ©voles, Ã©vÃ©nements et annonces."
      cards={[]}
    >
      <ActualitesList />
    </InfoPage>
  );
}
