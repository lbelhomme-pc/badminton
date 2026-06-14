import type { Metadata } from "next";
import { CommandeVolants } from "@/components/member/commande-volants";

export const metadata: Metadata = {
  title: "Commander des volants - CF2V41",
  description: "Réservation simple de volants pour les adhérents du CF2V41."
};

export default function CommandeVolantsPage() {
  return <CommandeVolants />;
}
