import type { Metadata } from "next";
import TarifsPage from "@/app/inscriptions/tarifs/page";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Tarifs - CF2V41",
  description: "Tarifs et formules d'inscription du CF2V41.",
  alternates: canonical("/tarifs")
};

export default TarifsPage;
