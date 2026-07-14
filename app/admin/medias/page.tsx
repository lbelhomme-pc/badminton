import type { Metadata } from "next";
import { AdminMedias } from "@/components/admin/admin-medias";

export const metadata: Metadata = {
  title: "Admin médiathèque - CFVV",
  description: "Gestion des images et fichiers publics du CFVV."
};

export default function AdminMediasPage() {
  return <AdminMedias />;
}
