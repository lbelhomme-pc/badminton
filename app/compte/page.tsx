import type { Metadata } from "next";
import { MemberDashboard } from "@/components/member/member-dashboard";

export const metadata: Metadata = {
  title: "Espace adhérent - CFVV41",
  description: "Tableau de bord personnel, réservations et commandes de volants."
};

export default function ComptePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <MemberDashboard />
    </div>
  );
}
