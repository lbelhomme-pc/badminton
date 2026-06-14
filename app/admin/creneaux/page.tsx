import type { Metadata } from "next";
import { AdminCreneaux } from "@/components/admin/admin-creneaux";

export const metadata: Metadata = {
  title: "Admin créneaux - CF2V41",
  description: "Gestion des créneaux du CF2V41."
};

export default function AdminCreneauxPage() {
  return <AdminCreneaux />;
}
