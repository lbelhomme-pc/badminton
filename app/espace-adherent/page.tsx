import type { Metadata } from "next";
import { PrivateMemberArea } from "@/components/member/private-member-area";

export const metadata: Metadata = {
  title: "Espace adhérent - CFVV",
  description: "Tableau de bord privé et sécurisé des adhérents du CFVV."
};

export default function EspaceAdherentPage() {
  return <PrivateMemberArea />;
}
