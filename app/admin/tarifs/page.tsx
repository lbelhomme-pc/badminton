import type { Metadata } from "next";
import { AdminTarifs } from "@/components/admin/admin-tarifs";

export const metadata: Metadata = {
  title: "Admin tarifs - CF2V41",
  description: "Gestion des tarifs affichés sur le site du CF2V41."
};

export default function AdminTarifsPage() {
  return <AdminTarifs />;
}
