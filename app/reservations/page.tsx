import type { Metadata } from "next";
import { InfoPage } from "@/components/public/info-page";

export const metadata: Metadata = {
  title: "Réservations - CFVV",
  description: "Réserver un créneau ou des volants au CFVV."
};

export default function ReservationsPage() {
  return (
    <InfoPage
      eyebrow="Réservations"
      title="Réserver au CFVV"
      intro="La réservation doit être rapide : choisir un créneau, confirmer sa place, ou réserver des volants à régler sur place."
      cards={[
        { title: "Créneaux", text: "Voir les disponibilités et réserver une place.", href: "/reservations/creneaux" },
        { title: "Volants", text: "Réserver un tube et suivre sa commande.", href: "/reservations/volants" }
      ]}
    />
  );
}
