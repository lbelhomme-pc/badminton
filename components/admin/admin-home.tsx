"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminRoute } from "@/components/auth/admin-route";
import { Card } from "@/components/ui/card";
import {
  fetchActualites,
  fetchAllReservations,
  fetchCreneaux,
  fetchProfiles,
  fetchVolants
} from "@/services/supabase-data.service";

const adminLinks = [
  { href: "/admin/creneaux", label: "Gérer les créneaux", text: "Créer, activer ou désactiver les séances." },
  { href: "/admin/reservations", label: "Voir les réservations", text: "Suivre les demandes et modifier les statuts." },
  { href: "/admin/actualites", label: "Publier une actualité", text: "Informer les adhérents et les visiteurs." },
  { href: "/admin/adherents", label: "Adhérents", text: "Consulter les profils utiles au club." },
  { href: "/admin/volants", label: "Volants", text: "Suivre le stock et les demandes simples." }
];

export function AdminHome() {
  return (
    <AdminRoute>
      <AdminHomeContent />
    </AdminRoute>
  );
}

function AdminHomeContent() {
  const [stats, setStats] = useState({
    adherents: 0,
    reservations: 0,
    creneaux: 0,
    actualites: 0,
    volants: 0
  });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [profiles, reservations, creneaux, actualites, volants] = await Promise.all([
        fetchProfiles(),
        fetchAllReservations(),
        fetchCreneaux(),
        fetchActualites(true),
        fetchVolants()
      ]);

      setStats({
        adherents: profiles.data.length,
        reservations: reservations.data.length,
        creneaux: creneaux.data.length,
        actualites: actualites.data.length,
        volants: volants.data.length
      });

      setMessage(profiles.error || reservations.error || creneaux.error || actualites.error || volants.error);
    }

    load();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Administration</p>
        <h1 className="mt-2 text-4xl font-black text-court-900">Pilotage du CFVV41</h1>
        <p className="mt-3 max-w-2xl text-ink-500">
          Les actions sensibles restent protégées par les règles Supabase RLS, même si quelqu'un appelle la base directement.
        </p>
      </div>

      {message ? <p className="mb-6 rounded-lg bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700">{message}</p> : null}

      <section className="grid gap-4 md:grid-cols-5">
        {[
          ["Adhérents", stats.adherents],
          ["Réservations", stats.reservations],
          ["Créneaux", stats.creneaux],
          ["Actualités", stats.actualites],
          ["Volants", stats.volants]
        ].map(([label, value]) => (
          <Card key={label} className="p-5">
            <p className="text-sm font-semibold text-ink-500">{label}</p>
            <p className="mt-2 text-3xl font-black text-court-900">{value}</p>
          </Card>
        ))}
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {adminLinks.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full p-5">
              <h2 className="text-xl font-black text-court-900">{item.label}</h2>
              <p className="mt-2 text-sm leading-6 text-ink-500">{item.text}</p>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
