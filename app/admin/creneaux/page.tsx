import type { Metadata } from "next";
import { AdminCreneaux } from "@/components/admin/admin-creneaux";

export const metadata: Metadata = {
  title: "Admin créneaux - CFVV",
  description: "Gestion des créneaux du CFVV."
};

export default function AdminCreneauxPage() {
  return <AdminCreneaux />;
}
