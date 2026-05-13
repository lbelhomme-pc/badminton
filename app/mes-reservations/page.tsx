import type { Metadata } from "next";
import { MyReservations } from "@/components/member/my-reservations";

export const metadata: Metadata = {
  title: "Mes réservations - CFVV41",
  description: "Réservations de créneaux de l'adhérent CFVV41."
};

export default function MesReservationsPage() {
  return <MyReservations />;
}
