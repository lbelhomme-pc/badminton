import type { Metadata } from "next";
import { PrivateDocumentsLibrary } from "@/components/member/private-documents-library";

export const metadata: Metadata = {
  title: "Documents privés - CFVV",
  description: "Bibliothèque documentaire privée des adhérents du CFVV."
};

export default function DocumentsPage() {
  return <PrivateDocumentsLibrary />;
}
