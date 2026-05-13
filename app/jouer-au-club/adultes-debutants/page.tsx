import { InfoPage } from "@/components/public/info-page";

export default function AdultesDebutantsPage() {
  return (
    <InfoPage
      eyebrow="Jouer au club"
      title="Adultes débutants"
      intro="Un parcours simple pour venir essayer, apprendre les bases et rejoindre progressivement les créneaux loisirs."
      cards={[
        { title: "Séance d’essai", text: "Venez tester sans pression avec un créneau conseillé.", href: "/inscriptions/seance-essai" },
        { title: "Bases techniques", text: "Service, dégagement, amorti, placement et sécurité sur le terrain." },
        { title: "Intégration", text: "Des partenaires et des responsables pour entrer dans le jeu sans se sentir perdu." }
      ]}
    />
  );
}
