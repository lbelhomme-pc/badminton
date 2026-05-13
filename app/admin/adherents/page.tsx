import type { Metadata } from "next";
import { AdminAdherents } from "@/components/admin/admin-adherents";

export const metadata: Metadata = {
  title: "Admin adhérents - CFVV41",
  description: "Liste des adhérents du CFVV41."
};

export default function AdminAdherentsPage() {
  return <AdminAdherents />;
}
