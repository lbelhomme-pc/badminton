import type { Metadata } from "next";
import EvenementsPage from "@/app/vie-du-club/evenements/page";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Agenda - CFVV",
  description: "Agenda public du Club des Fous du Volant du Vendômois.",
  alternates: canonical("/agenda")
};

export default EvenementsPage;
