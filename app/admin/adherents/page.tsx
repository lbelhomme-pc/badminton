import type { Metadata } from "next";
import { AdminAdherents } from "@/components/admin/admin-adherents";

export const metadata: Metadata = {
  title: "Admin adhérents - CF2V41",
  description: "Liste des adhérents du CF2V41."
};

export default function AdminAdherentsPage() {
  return <AdminAdherents />;
}
