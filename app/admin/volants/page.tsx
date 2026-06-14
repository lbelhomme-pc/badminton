import type { Metadata } from "next";
import { AdminVolants } from "@/components/admin/admin-volants";

export const metadata: Metadata = {
  title: "Admin volants - CF2V41",
  description: "Gestion des volants du CF2V41."
};

export default function AdminVolantsPage() {
  return <AdminVolants />;
}
