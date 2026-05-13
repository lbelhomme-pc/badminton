import type { Metadata } from "next";
import { InfoPage } from "@/components/public/info-page";

export const metadata: Metadata = {
  title: "Le club - CFVV41",
  description: "Présentation du Club des fous du Volant Vendômois, bureau, encadrants et gymnases."
};

export default function ClubPage() {
  return (
    <InfoPage
      eyebrow="Le club"
      title="Club des fous du Volant Vendômois"
      intro="Le CFVV41 rassemble les joueuses et joueurs de Vendôme autour d’un badminton convivial, progressif et structuré."
      cards={[
        { title: "Présentation", text: "L’esprit du club, ses valeurs et son fonctionnement au quotidien.", href: "/club/presentation" },
        { title: "Bureau et bénévoles", text: "Les personnes qui organisent la vie associative et les temps forts.", href: "/club/bureau-benevoles" },
        { title: "Encadrants", text: "Les responsables de créneaux et les personnes qui accompagnent la progression.", href: "/club/encadrants" },
        { title: "Gymnases et accès", text: "Adresses, accès, stationnement et informations pratiques.", href: "/club/gymnases-acces" }
      ]}
    />
  );
}
