"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowDown, ArrowUp, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  heroBadgeIconOptions,
  type HeroBadgeIcon,
  type PageHeroBadge
} from "@/lib/site-content";
import type { PublicContentSettings } from "@/services/club.service";
import { upsertSiteSetting } from "@/services/supabase-data.service";

interface InlineHeroBadgesEditorProps {
  content: PublicContentSettings;
  contentKey: string;
  badges: PageHeroBadge[];
}

async function refreshPublicSite() {
  const supabase = createSupabaseBrowserClient();
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  if (!session?.access_token) return;

  await fetch("/api/revalidate-site", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.access_token}` }
  });
}

function createBadge(index: number): PageHeroBadge {
  return {
    id: `case-${Date.now()}-${index}`,
    label: "Nouvelle case",
    icon: "info"
  };
}

export function InlineHeroBadgesEditor({ content, contentKey, badges: initialBadges }: InlineHeroBadgesEditorProps) {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [badges, setBadges] = useState<PageHeroBadge[]>(initialBadges);

  useEffect(() => {
    if (!open) setBadges(initialBadges);
  }, [initialBadges, open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, saving]);

  function updateBadge(index: number, field: "label" | "icon", value: string) {
    setBadges((current) => current.map((badge, badgeIndex) => (
      badgeIndex === index ? { ...badge, [field]: value } as PageHeroBadge : badge
    )));
  }

  function moveBadge(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= badges.length) return;
    setBadges((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function save() {
    const cleanedBadges = badges
      .map((badge) => ({ ...badge, label: badge.label.trim() }))
      .filter((badge) => badge.label.length > 0);

    setSaving(true);
    setMessage("Publication des cases...");

    const nextContent: PublicContentSettings = {
      ...content,
      pages: {
        ...content.pages,
        [contentKey]: {
          ...(content.pages[contentKey] ?? {}),
          badges: cleanedBadges
        }
      }
    };
    const result = await upsertSiteSetting({
      key: "content",
      value: { ...nextContent },
      visibility: "public"
    });

    if (!result.ok) {
      setSaving(false);
      setMessage(result.message);
      return;
    }

    try {
      await refreshPublicSite();
    } catch {
      // Les données sont enregistrées ; le rafraîchissement Next retente la lecture.
    }
    setBadges(cleanedBadges);
    router.refresh();
    setSaving(false);
    setMessage("Cases publiées sur le site.");
    setTimeout(() => setOpen(false), 700);
  }

  if (!isAdmin) return null;

  const dialog = open ? (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-[#031d2b]/70 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) setOpen(false);
      }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="inline-badges-title" className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white text-court-900 shadow-2xl sm:max-w-2xl sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-court-100 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase text-[#0097a9]">Modification directe</p>
            <h2 id="inline-badges-title" className="font-display text-2xl font-black">Modifier les petites cases</h2>
          </div>
          <button type="button" onClick={() => setOpen(false)} disabled={saving} className="flex h-10 w-10 items-center justify-center rounded-full bg-court-50 hover:bg-court-100" aria-label="Fermer">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-4 p-5">
          <p className="text-sm leading-6 text-ink-600">Changez le texte ou l’icône, déplacez une case avec les flèches, ou supprimez-la. Vous pouvez aussi n’afficher aucune case.</p>

          {badges.length > 0 ? badges.map((badge, index) => (
            <div key={badge.id} className="rounded-xl border border-court-100 bg-court-50 p-4">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_170px_auto] sm:items-end">
                <label className="grid gap-2 text-sm font-semibold">
                  Texte de la case
                  <input
                    type="text"
                    value={badge.label}
                    onChange={(event) => updateBadge(index, "label", event.target.value)}
                    className="h-11 rounded-lg border border-court-200 bg-white px-3 outline-none focus:border-court-500 focus:ring-2 focus:ring-court-500/20"
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold">
                  Icône
                  <select
                    value={badge.icon}
                    onChange={(event) => updateBadge(index, "icon", event.target.value as HeroBadgeIcon)}
                    className="h-11 rounded-lg border border-court-200 bg-white px-3 outline-none focus:border-court-500 focus:ring-2 focus:ring-court-500/20"
                  >
                    {heroBadgeIconOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
                <div className="flex gap-2">
                  <SmallButton label="Monter" disabled={index === 0} onClick={() => moveBadge(index, -1)}><ArrowUp /></SmallButton>
                  <SmallButton label="Descendre" disabled={index === badges.length - 1} onClick={() => moveBadge(index, 1)}><ArrowDown /></SmallButton>
                  <SmallButton label="Supprimer" danger onClick={() => setBadges((current) => current.filter((_, badgeIndex) => badgeIndex !== index))}><Trash2 /></SmallButton>
                </div>
              </div>
            </div>
          )) : (
            <div className="rounded-xl border border-dashed border-court-200 bg-court-50 px-4 py-8 text-center text-sm font-semibold text-ink-500">Aucune petite case ne sera affichée.</div>
          )}

          <button type="button" onClick={() => setBadges((current) => [...current, createBadge(current.length)])} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#0097a9] px-4 font-display text-sm font-black text-[#007f8f] hover:bg-[#0097a9]/5">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Ajouter une case
          </button>

          {message ? <p role="status" className="rounded-lg bg-court-50 px-4 py-3 text-sm font-semibold text-court-800">{message}</p> : null}
        </div>

        <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-court-100 bg-white px-5 py-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => setOpen(false)} disabled={saving} className="h-11 rounded-lg border border-court-200 px-5 font-display text-sm font-bold hover:bg-court-50">Annuler</button>
          <button type="button" onClick={save} disabled={saving} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#0097a9] px-5 font-display text-sm font-black text-white hover:bg-[#007f8f] disabled:opacity-60">
            <Save className="h-4 w-4" aria-hidden="true" />
            {saving ? "Publication..." : "Publier les cases"}
          </button>
        </div>
      </section>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        data-admin-edit-action
        onClick={() => {
          setBadges(initialBadges);
          setMessage(null);
          setOpen(true);
        }}
        className="hidden min-h-10 items-center gap-2 rounded-full border-2 border-white bg-[#0097a9] px-3 py-2 font-display text-xs font-black text-white shadow-[0_8px_22px_rgba(3,29,43,0.28)] hover:bg-[#007f8f]"
      >
        <Pencil className="h-4 w-4" aria-hidden="true" />
        Modifier ces cases
      </button>
      {typeof document !== "undefined" && dialog ? createPortal(dialog, document.body) : null}
    </>
  );
}

function SmallButton({ label, onClick, disabled = false, danger = false, children }: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactElement<{ className?: string }>;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label} className={`flex h-11 w-11 items-center justify-center rounded-lg border bg-white disabled:cursor-not-allowed disabled:opacity-35 ${danger ? "border-red-200 text-red-700 hover:bg-red-50" : "border-court-200 hover:bg-court-100"}`}>
      <span className="[&>svg]:h-4 [&>svg]:w-4">{children}</span>
    </button>
  );
}
