import type { Metadata } from "next";
import { AdminTarifs } from "@/components/admin/admin-tarifs";

export const metadata: Metadata = {
  title: "Admin tarifs - CFVV",
  description: "Gestion des tarifs affichés sur le site du CFVV."
};

export default function AdminTarifsPage() {
  return <AdminTarifs />;
}
