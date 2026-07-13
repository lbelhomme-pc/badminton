import type { Metadata } from "next";
import { AdminActualites } from "@/components/admin/admin-actualites";

export const metadata: Metadata = {
  title: "Admin actualités - CFVV",
  description: "Gestion des actualités du CFVV."
};

export default function AdminActualitesPage() {
  return <AdminActualites />;
}
