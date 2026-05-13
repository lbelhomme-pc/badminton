import type { Metadata } from "next";
import { AdminCreneaux } from "@/components/admin/admin-creneaux";

export const metadata: Metadata = {
  title: "Admin créneaux - CFVV41",
  description: "Gestion des créneaux du CFVV41."
};

export default function AdminCreneauxPage() {
  return <AdminCreneaux />;
}
