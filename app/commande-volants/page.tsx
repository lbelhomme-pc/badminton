import type { Metadata } from "next";
import { CommandeVolants } from "@/components/member/commande-volants";

export const metadata: Metadata = {
  title: "Commander des volants - CFVV41",
  description: "Réservation simple de volants pour les adhérents du CFVV41."
};

export default function CommandeVolantsPage() {
  return <CommandeVolants />;
}
