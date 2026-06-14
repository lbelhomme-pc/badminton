import type { Metadata } from "next";
import { PrivateMemberArea } from "@/components/member/private-member-area";

export const metadata: Metadata = {
  title: "Espace adhérent - CF2V41",
  description: "Tableau de bord privé des adhérents du CF2V41."
};

export default function EspaceAdherentPage() {
  return <PrivateMemberArea />;
}
