import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Espace adhérent - CFVV",
  description: "Redirection vers le tableau de bord adhérent sécurisé du CFVV."
};

export default function ComptePage() {
  redirect("/espace-adherent");
}
