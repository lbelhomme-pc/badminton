import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Volants - CFVV",
  description: "Redirection vers la boutique de volants sécurisée réservée aux adhérents."
};

export default function VolantsPage() {
  redirect("/commande-volants");
}
