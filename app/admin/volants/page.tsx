import type { Metadata } from "next";
import { AdminVolants } from "@/components/admin/admin-volants";

export const metadata: Metadata = {
  title: "Admin volants - CFVV41",
  description: "Gestion des volants du CFVV41."
};

export default function AdminVolantsPage() {
  return <AdminVolants />;
}
