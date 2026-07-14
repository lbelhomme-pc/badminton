import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Volants - CFVV",
  description: "Redirection vers la boutique de volants securisee reservee aux adherents."
};

export default function VolantsPage() {
  redirect("/commande-volants");
}
