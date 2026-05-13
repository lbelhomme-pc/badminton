import type { Metadata } from "next";
import { AdminHome } from "@/components/admin/admin-home";

export const metadata: Metadata = {
  title: "Admin - CFVV41",
  description: "Interface de gestion du CFVV41."
};

export default function AdminPage() {
  return <AdminHome />;
}
