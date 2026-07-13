import type { Metadata } from "next";
import { AdminDocuments } from "@/components/admin/admin-documents";

export const metadata: Metadata = {
  title: "Admin documents - CFVV",
  description: "Gestion des documents privés du CFVV."
};

export default function AdminDocumentsPage() {
  return <AdminDocuments />;
}
