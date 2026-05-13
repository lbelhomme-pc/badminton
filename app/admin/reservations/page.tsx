import type { Metadata } from "next";
import { AdminReservations } from "@/components/admin/admin-reservations";

export const metadata: Metadata = {
  title: "Admin réservations - CFVV41",
  description: "Gestion des réservations du CFVV41."
};

export default function AdminReservationsPage() {
  return <AdminReservations />;
}
