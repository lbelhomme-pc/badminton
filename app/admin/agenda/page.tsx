import type { Metadata } from "next";
import { AdminAgenda } from "@/components/admin/admin-agenda";

export const metadata: Metadata = {
  title: "Admin agenda - CFVV",
  description: "Gestion des événements, publications, programmations et annulations du CFVV."
};

export default function AdminAgendaPage() {
  return <AdminAgenda />;
}
