"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminFeedback, errorFeedback, type AdminFeedbackMessage } from "@/components/admin/admin-feedback";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminRoute } from "@/components/auth/admin-route";
import { useAuth } from "@/components/auth/auth-provider";
import { Card } from "@/components/ui/card";
import {
  fetchActualites,
  fetchAllReservations,
  fetchCreneaux,
  fetchProfiles,
  fetchTarifs,
  fetchVolants
} from "@/services/supabase-data.service";

const adminLinks = [
  { href: "/admin/creneaux", label: "Gérer les créneaux", text: "Créer, modifier, désactiver ou annuler une date.", minRole: "manager" },
  { href: "/admin/reservations", label: "Voir les réservations", text: "Suivre les demandes avec le nom des adhérents.", minRole: "manager" },
  { href: "/admin/actualites", label: "Publier une actualité", text: "Informer les adhérents et les visiteurs.", minRole: "manager" },
  { href: "/admin/volants", label: "Volants", text: "Suivre le stock et les demandes simples.", minRole: "manager" },
  { href: "/admin/tarifs", label: "Modifier les tarifs", text: "Mettre à jour les prix affichés sur le site.", minRole: "admin" },
  { href: "/admin/adherents", label: "Adhérents", text: "Consulter les profils utiles au club.", minRole: "admin" },
  { href: "/admin/parametres", label: "Paramètres du site", text: "Modifier contact, bureau, identité du club et liens utiles.", minRole: "admin" }
];

export function AdminHome() {
  return (
    <AdminRoute requiredRole="manager">
      <AdminHomeContent />
    </AdminRoute>
  );
}

function AdminHomeContent() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState({
    adherents: 0,
    reservations: 0,
    creneaux: 0,
    actualites: 0,
    tarifs: 0,
    volants: 0
  });
  const [feedback, setFeedback] = useState<AdminFeedbackMessage>(null);

  useEffect(() => {
    async function load() {
      const [reservations, creneaux, actualites, volants] = await Promise.all([
        fetchAllReservations(),
        fetchCreneaux(),
        fetchActualites(true),
        fetchVolants()
      ]);
      const profiles = isAdmin ? await fetchProfiles() : { data: [], error: null };
      const tarifs = isAdmin ? await fetchTarifs(true) : { data: [], error: null };

      setStats({
        adherents: profiles.data.length,
        reservations: reservations.data.length,
        creneaux: creneaux.data.length,
        actualites: actualites.data.length,
        tarifs: tarifs.data.length,
        volants: volants.data.length
      });

      setFeedback(errorFeedback(profiles.error || reservations.error || creneaux.error || actualites.error || tarifs.error || volants.error));
    }

    load();
  }, [isAdmin]);

  const visibleLinks = adminLinks.filter((item) => item.minRole === "manager" || isAdmin);
  const statCards = [
    ...(isAdmin ? [["Adhérents", stats.adherents], ["Tarifs", stats.tarifs]] : []),
    ["Réservations", stats.reservations],
    ["Créneaux", stats.creneaux],
    ["Actualités", stats.actualites],
    ["Volants", stats.volants]
  ];

  return (
    <AdminShell
      title="Pilotage du CF2V41"
      intro="Les actions sensibles restent protégées par les règles Supabase RLS, même si quelqu'un appelle la base directement."
    >
      <AdminFeedback feedback={feedback} className="mb-6" />

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {statCards.map(([label, value]) => (
          <Card key={label} className="p-5">
            <p className="text-sm font-semibold text-ink-500">{label}</p>
            <p className="mt-2 text-3xl font-black text-court-900">{value}</p>
          </Card>
        ))}
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleLinks.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full p-5">
              <h2 className="text-xl font-black text-court-900">{item.label}</h2>
              <p className="mt-2 text-sm leading-6 text-ink-500">{item.text}</p>
            </Card>
          </Link>
        ))}
      </section>
    </AdminShell>
  );
}
