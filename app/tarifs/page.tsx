import type { Metadata } from "next";
import TarifsPage from "@/app/inscriptions/tarifs/page";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Tarifs et inscriptions - CFVV",
  description: "Tarifs, pièces nécessaires, procédure et informations de saison du CFVV.",
  alternates: canonical("/tarifs")
};

export default TarifsPage;
