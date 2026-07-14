import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Espace adherent - CFVV",
  description: "Redirection vers le tableau de bord adherent securise du CFVV."
};

export default function ComptePage() {
  redirect("/espace-adherent");
}
