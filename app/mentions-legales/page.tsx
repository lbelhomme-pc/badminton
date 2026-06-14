import { InfoPage } from "@/components/public/info-page";

export default function MentionsLegalesPage() {
  return (
    <InfoPage
      eyebrow="Informations légales"
      title="Mentions légales"
      intro="Page à compléter avec les informations officielles de l'association, son responsable de publication et son hébergeur."
      cards={[
        { title: "Association", text: "Club des fous du Volant Vendômois - CF2V41. Siège social : Naveil." },
        { title: "Responsable de publication", text: "Bureau du CF2V41." },
        { title: "Hébergement", text: "Site hébergé par Vercel." }
      ]}
    />
  );
}
