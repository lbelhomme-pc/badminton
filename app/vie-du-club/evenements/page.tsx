import { InfoPage } from "@/components/public/info-page";
import { formatDate } from "@/lib/utils";
import { getEvents } from "@/services/club.service";

export default function EvenementsPage() {
  return (
    <InfoPage
      eyebrow="Vie du club"
      title="Événements"
      intro="Les temps forts à venir pour jouer, aider ou simplement partager un moment club."
      cards={getEvents().map((event) => ({
        title: event.title,
        text: `${formatDate(event.date)} · ${event.description}`
      }))}
    />
  );
}
