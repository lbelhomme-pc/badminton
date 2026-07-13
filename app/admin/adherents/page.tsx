import type { Metadata } from "next";
import { AdminAdherents } from "@/components/admin/admin-adherents";

export const metadata: Metadata = {
  title: "Admin adhérents - CFVV",
  description: "Liste des adhérents du CFVV."
};

export default function AdminAdherentsPage() {
  return <AdminAdherents />;
}
