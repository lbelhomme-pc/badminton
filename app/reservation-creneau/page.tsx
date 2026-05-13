import type { Metadata } from "next";
import { ReservationCreneau } from "@/components/member/reservation-creneau";

export const metadata: Metadata = {
  title: "Réserver un créneau - CFVV41",
  description: "Réserver un créneau de badminton au CFVV41."
};

export default function ReservationCreneauPage() {
  return <ReservationCreneau />;
}
