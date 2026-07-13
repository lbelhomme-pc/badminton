"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminFeedback, errorFeedback, type AdminFeedbackMessage } from "@/components/admin/admin-feedback";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminRoute } from "@/components/auth/admin-route";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  fetchActualites,
  fetchAllReservations,
  fetchCreneaux,
  fetchPrivateDocumentsForManager,
  fetchProfiles,
  fetchTarifs,
  fetchVolants
} from "@/services/supabase-data.service";

const adminLinks = [
  { href: "/admin/creneaux", label: "Gérer les créneaux", text: "Créer, modifier, désactiver ou annuler une date.", minRole: "manager" },
  { href: "/admin/reservations", label: "Voir les réservations", text: "Suivre les demandes avec le nom des adhérents.", minRole: "manager" },
  { href: "/admin/actualites", label: "Publier une actualité", text: "Informer les adhérents et les visiteurs.", minRole: "manager" },
  { href: "/admin/volants", label: "Volants", text: "Suivre le stock et les demandes simples.", minRole: "manager" },
  { href: "/admin/documents", label: "Documents privés", text: "Publier, archiver ou retirer les fichiers réservés aux adhérents.", minRole: "manager" },
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
  const { configured, loading, user, profile, roles, isManager, isAdmin, refreshProfile } = useAuth();
  const [stats, setStats] = useState({
    adherents: 0,
    reservations: 0,
    creneaux: 0,
    actualites: 0,
    documents: 0,
    brouillons: 0,
    tarifs: 0,
    volants: 0
  });
  const [feedback, setFeedback] = useState<AdminFeedbackMessage>(null);
  const [pendingProfileRefresh, setPendingProfileRefresh] = useState(false);

  useEffect(() => {
    async function load() {
      const [reservations, creneaux, actualites, volants] = await Promise.all([
        fetchAllReservations(),
        fetchCreneaux(),
        fetchActualites(true),
        fetchVolants()
      ]);
      const documents = await fetchPrivateDocumentsForManager();
      const profiles = isAdmin ? await fetchProfiles() : { data: [], error: null };
      const tarifs = isAdmin ? await fetchTarifs(true) : { data: [], error: null };

      setStats({
        adherents: profiles.data.length,
        reservations: reservations.data.length,
        creneaux: creneaux.data.length,
        actualites: actualites.data.length,
        documents: documents.data.length,
        brouillons: documents.data.filter((document) => document.statut === "brouillon").length,
        tarifs: tarifs.data.length,
        volants: volants.data.length
      });

      setFeedback(errorFeedback(profiles.error || reservations.error || creneaux.error || actualites.error || documents.error || tarifs.error || volants.error));
    }

    load();
  }, [isAdmin]);

  const visibleLinks = adminLinks.filter((item) => item.minRole === "manager" || isAdmin);
  const shortUserId = user?.id ? `${user.id.slice(0, 8)}...${user.id.slice(-4)}` : "non connecté";
  const statCards = [
    ...(isAdmin ? [["Adhérents", stats.adherents], ["Tarifs", stats.tarifs]] : []),
    ["Réservations", stats.reservations],
    ["Créneaux", stats.creneaux],
    ["Actualités", stats.actualites],
    ["Documents", stats.documents],
    ["Brouillons", stats.brouillons],
    ["Volants", stats.volants]
  ];

  return (
    <AdminShell
      title="Pilotage du CFVV"
      intro="Les actions sensibles restent protégées par les règles Supabase RLS, même si quelqu'un appelle la base directement."
    >
      <AdminFeedback feedback={feedback} className="mb-6" />

      <Card className="mb-6 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Diagnostic auth</p>
            <h2 className="mt-1 text-2xl font-black text-court-900">État de la session admin</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-500">
              Ce bloc aide à repérer rapidement un problème de session, de profil ou de rôle après une modification Supabase.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={pendingProfileRefresh}
            onClick={async () => {
              setPendingProfileRefresh(true);
              try {
                await refreshProfile();
              } finally {
                setPendingProfileRefresh(false);
              }
            }}
          >
            {pendingProfileRefresh ? "Actualisation..." : "Rafraîchir le profil"}
          </Button>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DiagnosticItem label="Supabase" value={configured ? "configuré" : "non configuré"} tone={configured ? "ok" : "warn"} />
          <DiagnosticItem label="Auth chargée" value={loading ? "en cours" : "oui"} tone={loading ? "warn" : "ok"} />
          <DiagnosticItem label="Utilisateur" value={user?.email ?? shortUserId} tone={user ? "ok" : "warn"} />
          <DiagnosticItem label="Profil" value={profile ? `${profile.prenom ?? ""} ${profile.nom ?? ""}`.trim() || "profil trouvé" : "absent"} tone={profile ? "ok" : "warn"} />
          <DiagnosticItem label="ID utilisateur" value={shortUserId} />
          <DiagnosticItem label="Rôles app" value={roles.join(", ")} tone={roles.length > 0 ? "ok" : "warn"} />
          <DiagnosticItem label="Manager" value={isManager ? "oui" : "non"} tone={isManager ? "ok" : "warn"} />
          <DiagnosticItem label="Admin" value={isAdmin ? "oui" : "non"} tone={isAdmin ? "ok" : "warn"} />
        </dl>

        <div className="mt-5 rounded-lg bg-court-50 p-4">
          <p className="text-sm font-black text-court-900">À vérifier dans Supabase si une action échoue</p>
          <ul className="mt-2 grid gap-1 text-sm leading-6 text-ink-500 md:grid-cols-2">
            <li>Table `profiles` avec ton utilisateur.</li>
            <li>Table `user_roles` avec `admin` ou `manager`.</li>
            <li>RPC `set_user_roles` pour gérer les droits.</li>
            <li>RPC `create_shuttle_order` pour les volants.</li>
            <li>Table `stock_movements` et triggers associés.</li>
            <li>Table `contact_requests` pour les demandes.</li>
          </ul>
        </div>
      </Card>

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

function DiagnosticItem({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "ok" | "warn" | "neutral" }) {
  const toneClassName =
    tone === "ok"
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : tone === "warn"
        ? "border-orange-100 bg-orange-50 text-orange-700"
        : "border-court-100 bg-court-50 text-ink-600";

  return (
    <div className={`rounded-lg border px-4 py-3 ${toneClassName}`}>
      <dt className="text-xs font-black uppercase tracking-wide">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold">{value || "non renseigné"}</dd>
    </div>
  );
}
