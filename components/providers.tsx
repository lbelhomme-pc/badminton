"use client";

import { AuthProvider } from "@/components/auth/auth-provider";
import { AdminEditMode } from "@/components/admin/admin-edit-mode";
import { GlobalInlineTextEditor } from "@/components/admin/global-inline-text-editor";
import type { PublicContentSettings } from "@/services/club.service";

export function Providers({ children, content }: { children: React.ReactNode; content: PublicContentSettings }) {
  return (
    <AuthProvider>
      {children}
      <GlobalInlineTextEditor content={content} />
      <AdminEditMode />
    </AuthProvider>
  );
}
