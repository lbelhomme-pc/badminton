import type { Metadata } from "next";
import { ClubPhoto } from "@/components/public/club-photo";
import { InfoPage } from "@/components/public/info-page";
import { clubPhotoSlots, hasClubPhoto } from "@/lib/club-photos";

export const metadata: Metadata = {
  title: "Le club - CF2V41",
  description: "Présentation du Club des fous du Volant Vendômois, bureau, encadrants et gymnases."
};

export default function ClubPage() {
  const clubLifePhoto = clubPhotoSlots.clubLife;

  return (
    <InfoPage
      eyebrow="Le club"
      title="Club des fous du Volant Vendômois"
      intro="Le CF2V41 rassemble les joueuses et joueurs de Vendôme autour d'un badminton convivial, progressif et structuré."
      cards={[
        { title: "Présentation", text: "L'esprit du club, ses valeurs et son fonctionnement au quotidien.", href: "/club/presentation" },
        { title: "Bureau et bénévoles", text: "Les personnes qui organisent la vie associative et les temps forts.", href: "/club/bureau-benevoles" },
        { title: "Encadrants", text: "Les responsables de créneaux et les personnes qui accompagnent la progression.", href: "/club/encadrants" },
        { title: "Gymnases et accès", text: "Adresses, accès, stationnement et informations pratiques.", href: "/club/gymnases-acces" },
        { title: "Partenaires", text: "Soutien local, collectivités, entreprises et actions communes.", href: "/vie-du-club/partenaires" }
      ]}
    >
      {hasClubPhoto(clubLifePhoto) ? <ClubPhoto slot={clubLifePhoto} className="h-72 w-full md:h-96" /> : null}
    </InfoPage>
  );
}
