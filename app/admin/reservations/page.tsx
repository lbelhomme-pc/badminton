import type { Metadata } from "next";
import { AdminReservations } from "@/components/admin/admin-reservations";

export const metadata: Metadata = {
  title: "Admin réservations - CFVV",
  description: "Gestion des réservations du CFVV."
};

export default function AdminReservationsPage() {
  return <AdminReservations />;
}
