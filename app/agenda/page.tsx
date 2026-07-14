import type { Metadata } from "next";
import EvenementsPage from "@/app/vie-du-club/evenements/page";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Agenda - CFVV",
  description: "Agenda public du Club des fous du Volants Vendômois.",
  alternates: canonical("/agenda")
};

export default EvenementsPage;
