"use client";

import { AuthProvider } from "@/components/auth/auth-provider";
import { AdminEditMode } from "@/components/admin/admin-edit-mode";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <AdminEditMode />
    </AuthProvider>
  );
}
