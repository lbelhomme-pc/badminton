import type { Metadata } from "next";
import CreneauxPage from "@/app/jouer-au-club/creneaux/page";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Créneaux - CFVV",
  description: "Horaires et créneaux publics du Club des fous du Volants Vendômois.",
  alternates: canonical("/creneaux")
};

export default CreneauxPage;
