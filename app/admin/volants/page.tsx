import type { Metadata } from "next";
import { AdminVolants } from "@/components/admin/admin-volants";

export const metadata: Metadata = {
  title: "Admin volants - CFVV",
  description: "Gestion des volants du CFVV."
};

export default function AdminVolantsPage() {
  return <AdminVolants />;
}
