import type { Metadata } from "next";
import CreneauxPage from "@/app/jouer-au-club/creneaux/page";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Créneaux - CFVV",
  description: "Horaires et créneaux publics du Club des Fous du Volant du Vendômois.",
  alternates: canonical("/creneaux")
};

export default CreneauxPage;
