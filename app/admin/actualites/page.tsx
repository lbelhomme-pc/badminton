import type { Metadata } from "next";
import { AdminActualites } from "@/components/admin/admin-actualites";

export const metadata: Metadata = {
  title: "Admin actualités - CF2V41",
  description: "Gestion des actualités du CF2V41."
};

export default function AdminActualitesPage() {
  return <AdminActualites />;
}
