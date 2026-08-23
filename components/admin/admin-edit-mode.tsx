"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, Pencil, X } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

const editModeStorageKey = "cfvv41:admin-edit-mode";

export function AdminEditMode() {
  const pathname = usePathname();
  const { isAdmin, loading } = useAuth();
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (loading) return;

    const requestedByUrl = new URLSearchParams(window.location.search).get("edition") === "1";
    const stored = window.localStorage.getItem(editModeStorageKey) === "active";
    setActive(isAdmin && (requestedByUrl || stored));
  }, [isAdmin, loading]);

  useEffect(() => {
    document.body.classList.toggle("admin-edit-mode", isAdmin && active);
    return () => document.body.classList.remove("admin-edit-mode");
  }, [active, isAdmin]);

  function changeMode(next: boolean) {
    setActive(next);
    if (next) {
      window.localStorage.setItem(editModeStorageKey, "active");
    } else {
      window.localStorage.removeItem(editModeStorageKey);
    }
  }

  if (loading || !isAdmin) return null;

  if (pathname.startsWith("/admin")) {
    return (
      <Link
        href="/?edition=1"
        className="fixed bottom-24 right-4 z-[80] inline-flex items-center gap-2 rounded-full bg-[#0097a9] px-4 py-3 font-display text-sm font-black text-white shadow-[0_12px_32px_rgba(3,29,43,0.3)] md:bottom-5"
      >
        <Eye className="h-4 w-4" aria-hidden="true" />
        Voir le site à modifier
      </Link>
    );
  }

  if (!active) {
    return (
      <button
        type="button"
        onClick={() => changeMode(true)}
        className="fixed bottom-24 right-4 z-[80] inline-flex items-center gap-2 rounded-full bg-[#031d2b] px-4 py-3 font-display text-sm font-black text-white shadow-[0_12px_32px_rgba(3,29,43,0.3)] md:bottom-5"
      >
        <Pencil className="h-4 w-4" aria-hidden="true" />
        Modifier le site
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 left-1/2 z-[80] flex w-[min(94vw,620px)] -translate-x-1/2 flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#00a8bc]/40 bg-[#031d2b] px-4 py-3 text-white shadow-[0_16px_40px_rgba(3,29,43,0.38)] md:bottom-4">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00a8bc]">
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <p className="font-display text-sm font-black">Mode édition activé</p>
          <p className="text-xs text-white/75">Clique directement sur un texte souligné ou sur un crayon.</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => changeMode(false)}
        className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-3 py-2 text-sm font-bold hover:bg-white/10"
      >
        <X className="h-4 w-4" aria-hidden="true" />
        Quitter
      </button>
    </div>
  );
}
