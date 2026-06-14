import type { Metadata } from "next";
import { AdminReservations } from "@/components/admin/admin-reservations";

export const metadata: Metadata = {
  title: "Admin réservations - CF2V41",
  description: "Gestion des réservations du CF2V41."
};

export default function AdminReservationsPage() {
  return <AdminReservations />;
}
