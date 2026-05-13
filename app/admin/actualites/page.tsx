import type { Metadata } from "next";
import { AdminActualites } from "@/components/admin/admin-actualites";

export const metadata: Metadata = {
  title: "Admin actualités - CFVV41",
  description: "Gestion des actualités du CFVV41."
};

export default function AdminActualitesPage() {
  return <AdminActualites />;
}
