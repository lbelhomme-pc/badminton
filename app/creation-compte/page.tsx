import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Créer un compte - CF2V41",
  description: "Création d'un compte adhérent pour gérer les réservations du CF2V41."
};

export default function CreationComptePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Inscription numérique</p>
        <h1 className="mt-2 text-4xl font-black text-court-900">Créer mon compte adhérent</h1>
        <p className="mx-auto mt-3 max-w-2xl text-ink-500">
          Le compte sert à réserver un créneau, commander des volants et recevoir les informations du club.
        </p>
      </div>
      <SignupForm />
    </main>
  );
}
