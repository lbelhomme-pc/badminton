"use client";

import { ClubProvider } from "@/hooks/use-club-store";
import { AuthProvider } from "@/components/auth/auth-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ClubProvider>{children}</ClubProvider>
    </AuthProvider>
  );
}
