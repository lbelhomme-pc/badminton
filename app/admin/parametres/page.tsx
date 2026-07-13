import type { Metadata } from "next";
import { AdminParametres } from "@/components/admin/admin-parametres";

export const metadata: Metadata = {
  title: "Paramètres admin - CFVV",
  description: "Paramètres publics et informations de contact du CFVV."
};

export default function AdminParametresPage() {
  return <AdminParametres />;
}
