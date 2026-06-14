import type { Metadata } from "next";
import { MyReservations } from "@/components/member/my-reservations";

export const metadata: Metadata = {
  title: "Mes réservations - CF2V41",
  description: "Réservations de créneaux de l'adhérent CF2V41."
};

export default function MesReservationsPage() {
  return <MyReservations />;
}
