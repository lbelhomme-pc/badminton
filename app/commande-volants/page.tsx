import type { Metadata } from "next";
import { CommandeVolants } from "@/components/member/commande-volants";

export const metadata: Metadata = {
  title: "Commander des volants - CFVV",
  description: "Boutique de volants réservée aux adhérents du CFVV avec paiement HelloAsso."
};

export default function CommandeVolantsPage() {
  return <CommandeVolants />;
}
