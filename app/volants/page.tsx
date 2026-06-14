import type { Metadata } from "next";
import { ShuttleShop } from "@/components/shuttles/shuttle-shop";
import { getShuttleProducts } from "@/services/club.service";

export const metadata: Metadata = {
  title: "Volants - CF2V41",
  description: "Réservez des tubes de volants avec paiement sur place."
};

export default function VolantsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Volants</p>
        <h1 className="mt-2 text-4xl font-black text-court-900">Réserver des volants</h1>
        <p className="mt-3 max-w-2xl text-ink-500">
          Choisissez un tube, réservez la quantité souhaitée, puis réglez auprès du responsable volants à la salle.
        </p>
      </div>
      <ShuttleShop products={getShuttleProducts()} />
    </div>
  );
}
