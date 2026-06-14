import type { Metadata } from "next";
import { AdminHome } from "@/components/admin/admin-home";

export const metadata: Metadata = {
  title: "Admin - CF2V41",
  description: "Interface de gestion du CF2V41."
};

export default function AdminPage() {
  return <AdminHome />;
}
