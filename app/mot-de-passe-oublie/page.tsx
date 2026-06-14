import type { Metadata } from "next";
import { PasswordResetForm } from "@/components/auth/password-reset-form";

export const metadata: Metadata = {
  title: "Mot de passe oublié - CF2V41",
  description: "Réinitialiser le mot de passe d'un compte adhérent CF2V41."
};

export default function MotDePasseOubliePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PasswordResetForm />
    </main>
  );
}
