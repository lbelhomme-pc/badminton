import type { Metadata } from "next";
import CreneauxPage from "@/app/jouer-au-club/creneaux/page";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Créneaux - CF2V41",
  description: "Horaires et créneaux publics du Club des fous du Volant Vendômois.",
  alternates: canonical("/creneaux")
};

export default CreneauxPage;
