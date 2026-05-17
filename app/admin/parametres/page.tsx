import type { Metadata } from "next";
import { AdminParametres } from "@/components/admin/admin-parametres";

export const metadata: Metadata = {
  title: "Paramètres admin - CFVV41",
  description: "Paramètres publics et informations de contact du CFVV41."
};

export default function AdminParametresPage() {
  return <AdminParametres />;
}
