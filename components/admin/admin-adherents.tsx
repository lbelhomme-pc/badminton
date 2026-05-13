"use client";

import { useEffect, useState } from "react";
import { AdminRoute } from "@/components/auth/admin-route";
import { Card } from "@/components/ui/card";
import { fetchProfiles, type ProfileRow } from "@/services/supabase-data.service";

export function AdminAdherents() {
  return (
    <AdminRoute>
      <AdminAdherentsContent />
    </AdminRoute>
  );
}

function AdminAdherentsContent() {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchProfiles().then((result) => {
      setProfiles(result.data);
      setMessage(result.error);
    });
  }, []);

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
          </Card>
        ))}
      </section>
    </div>
  );
}
