import type { Metadata } from "next";
import { AdminParametres } from "@/components/admin/admin-parametres";

export const metadata: Metadata = {
  title: "Paramètres admin - CF2V41",
  description: "Paramètres publics et informations de contact du CF2V41."
};

export default function AdminParametresPage() {
  return <AdminParametres />;
}
