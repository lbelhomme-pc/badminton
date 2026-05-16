"use client";

import { useEffect, useState } from "react";
import { AdminRoute } from "@/components/auth/admin-route";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchProfiles, updateProfileRole, type ProfileRow } from "@/services/supabase-data.service";

const roleOptions = [
  { value: "adherent", label: "Adhérent" },
  { value: "entraineur", label: "Entraîneur" },
  { value: "bureau", label: "Bureau" },
  { value: "admin", label: "Admin" }
];

export function AdminAdherents() {
  return (
    <AdminRoute>
      <AdminAdherentsContent />
    </AdminRoute>
  );
}

function AdminAdherentsContent() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [rolesById, setRolesById] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const result = await fetchProfiles();
    setProfiles(result.data);
    setRolesById(Object.fromEntries(result.data.map((profile) => [profile.id, profile.role])));
    setMessage(result.error);
  }

  useEffect(() => {
    load();
  }, []);

  async function saveRole(profile: ProfileRow) {
    const role = rolesById[profile.id] ?? profile.role;

    if (profile.id === user?.id && role !== profile.role) {
      setMessage("Pour éviter de te bloquer, ton propre rôle ne peut pas être modifié ici.");
      return;
    }

    const result = await updateProfileRole(profile.id, role);
    setMessage(result.message);
    if (result.ok) await load();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black text-court-900">Adhérents</h1>
      <p className="mt-3 max-w-2xl text-ink-500">Liste réservée aux responsables. Les visiteurs ne peuvent pas lire ces données.</p>

      {message ? <p className="mt-6 rounded-lg bg-court-100 px-4 py-3 text-sm font-semibold text-court-900">{message}</p> : null}

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {profiles.map((profile) => (
          <Card key={profile.id} className="p-5">
            <h2 className="text-xl font-black text-court-900">
              {[profile.prenom, profile.nom].filter(Boolean).join(" ") || profile.email || "Adhérent"}
            </h2>
            <p className="mt-2 text-sm text-ink-500">{profile.email}</p>
            <p className="mt-1 text-sm text-ink-500">{profile.telephone || "Téléphone non renseigné"}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-court-100 px-3 py-1 text-xs font-black text-court-600">{profile.role}</span>
              {profile.categorie ? <span className="rounded-full bg-court-50 px-3 py-1 text-xs font-black text-ink-600">{profile.categorie}</span> : null}
            </div>
            <div className="mt-5 rounded-lg border border-court-200 bg-court-50 p-3">
              <label className="grid gap-2 text-sm font-semibold text-court-900">
                Rôle sur le site
                <select
                  value={rolesById[profile.id] ?? profile.role}
                  disabled={profile.id === user?.id}
                  onChange={(event) => setRolesById((current) => ({ ...current, [profile.id]: event.target.value }))}
                  className="h-11 rounded-lg border border-court-200 bg-white px-3 disabled:opacity-60"
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <Button className="mt-3 w-full" type="button" disabled={profile.id === user?.id} onClick={() => saveRole(profile)}>
                Enregistrer le rôle
              </Button>
              {profile.id === user?.id ? (
                <p className="mt-2 text-xs font-semibold text-ink-500">Ton propre rôle est verrouillé pour éviter une perte d’accès.</p>
              ) : null}
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
