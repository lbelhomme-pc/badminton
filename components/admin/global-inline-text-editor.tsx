"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { RotateCcw, Save, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { InlineTextOverrides } from "@/lib/site-content";
import type { PublicContentSettings } from "@/services/club.service";
import { upsertSiteSetting } from "@/services/supabase-data.service";

const scopeIds = ["site-header", "main-content", "site-footer"] as const;
const ignoredTags = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT", "SELECT", "OPTION"]);
const privatePathPrefixes = ["/admin", "/compte", "/espace-adherent", "/mes-reservations", "/commande-volants", "/reservation-creneau"];

interface SelectedText {
  key: string;
  node: Text;
  original: string;
  value: string;
}

function directTextNodes(element: Element) {
  return Array.from(element.childNodes).filter((node): node is Text => node.nodeType === Node.TEXT_NODE && Boolean(node.nodeValue?.trim()));
}

function isEditableTextNode(node: Text) {
  const parent = node.parentElement;
  if (!parent || !node.nodeValue?.trim() || ignoredTags.has(parent.tagName)) return false;
  if (parent.closest("[data-admin-edit-action], [data-inline-text-ignore], [role='dialog']")) return false;
  return Boolean(parent.closest(scopeIds.map((id) => `#${id}`).join(",")));
}

function elementSegment(element: Element) {
  if (element.id && scopeIds.includes(element.id as typeof scopeIds[number])) return `#${element.id}`;
  const siblings = element.parentElement
    ? Array.from(element.parentElement.children).filter((sibling) => sibling.tagName === element.tagName)
    : [];
  const index = Math.max(0, siblings.indexOf(element)) + 1;
  return `${element.tagName.toLowerCase()}:nth-of-type(${index})`;
}

function textNodeKey(node: Text) {
  const parent = node.parentElement;
  if (!parent) return null;
  const scope = parent.closest(scopeIds.map((id) => `#${id}`).join(","));
  if (!scope) return null;

  const segments: string[] = [];
  let current: Element | null = parent;
  while (current && current !== scope) {
    segments.unshift(elementSegment(current));
    current = current.parentElement;
  }
  const textIndex = directTextNodes(parent).indexOf(node);
  return `${scope.id}|${segments.join(">")}|text:${Math.max(0, textIndex)}`;
}

function overrideBucket(pathname: string, key: string) {
  return key.startsWith("site-header|") || key.startsWith("site-footer|") ? "__global__" : pathname;
}

function getAllEditableTextNodes() {
  const nodes: Text[] = [];
  for (const id of scopeIds) {
    const scope = document.getElementById(id);
    if (!scope) continue;
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
    let current = walker.nextNode();
    while (current) {
      if (isEditableTextNode(current as Text)) nodes.push(current as Text);
      current = walker.nextNode();
    }
  }
  return nodes;
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

export function GlobalInlineTextEditor({ content }: { content: PublicContentSettings }) {
  const { isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const originals = useRef(new Map<string, string>());
  const [overrides, setOverrides] = useState<InlineTextOverrides>(content.inlineTexts);
  const overridesRef = useRef(overrides);
  const [selected, setSelected] = useState<SelectedText | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setOverrides(content.inlineTexts);
    overridesRef.current = content.inlineTexts;
  }, [content.inlineTexts]);

  const scanAndApply = useCallback(() => {
    document.querySelectorAll(".admin-inline-text-target").forEach((element) => element.classList.remove("admin-inline-text-target"));
    if (privatePathPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) return;
    const active = document.body.classList.contains("admin-edit-mode");
    const pageOverrides = {
      ...(overridesRef.current.__global__ ?? {}),
      ...(overridesRef.current[pathname] ?? {})
    };

    for (const node of getAllEditableTextNodes()) {
      const key = textNodeKey(node);
      if (!key) continue;
      if (!originals.current.has(`${pathname}:${key}`)) originals.current.set(`${pathname}:${key}`, node.nodeValue ?? "");
      if (Object.prototype.hasOwnProperty.call(pageOverrides, key) && node.nodeValue !== pageOverrides[key]) {
        node.nodeValue = pageOverrides[key];
      }
      if (active && isAdmin) node.parentElement?.classList.add("admin-inline-text-target");
    }
  }, [isAdmin, pathname]);

  useEffect(() => {
    scanAndApply();
    const observer = new MutationObserver(() => scanAndApply());
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    for (const id of scopeIds) {
      const scope = document.getElementById(id);
      if (scope) observer.observe(scope, { childList: true, subtree: true });
    }
    return () => {
      observer.disconnect();
      document.querySelectorAll(".admin-inline-text-target").forEach((element) => element.classList.remove("admin-inline-text-target"));
    };
  }, [scanAndApply, overrides]);

  useEffect(() => {
    if (!isAdmin) return;
    const onClick = (event: MouseEvent) => {
      if (!document.body.classList.contains("admin-edit-mode")) return;
      if (privatePathPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) return;
      const target = event.target instanceof Element ? event.target.closest(".admin-inline-text-target") : null;
      if (!target || target.closest("[data-admin-edit-action], [data-inline-text-ignore]")) return;
      const node = directTextNodes(target)[0];
      if (!node) return;
      const key = textNodeKey(node);
      if (!key) return;

      event.preventDefault();
      event.stopPropagation();
      const original = originals.current.get(`${pathname}:${key}`) ?? node.nodeValue ?? "";
      const value = node.nodeValue ?? "";
      setSelected({ key, node, original, value });
      setDraft(value.trim());
      setMessage(null);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [isAdmin, pathname]);

  async function publish(value: string, restore = false) {
    if (!selected) return;
    setSaving(true);
    setMessage("Publication du texte...");
    const bucket = overrideBucket(pathname, selected.key);
    const pageOverrides = { ...(overrides[bucket] ?? {}) };
    if (restore) delete pageOverrides[selected.key];
    else pageOverrides[selected.key] = value;
    const nextOverrides = { ...overrides, [bucket]: pageOverrides };
    const nextContent: PublicContentSettings = { ...content, inlineTexts: nextOverrides };
    const result = await upsertSiteSetting({ key: "content", value: { ...nextContent }, visibility: "public" });

    if (!result.ok) {
      setSaving(false);
      setMessage(result.message);
      return;
    }

    selected.node.nodeValue = restore ? selected.original : value;
    overridesRef.current = nextOverrides;
    setOverrides(nextOverrides);
    try { await refreshPublicSite(); } catch { /* L'enregistrement Supabase est déjà effectué. */ }
    router.refresh();
    setSaving(false);
    setMessage(restore ? "Texte d’origine restauré." : "Texte publié.");
    setTimeout(() => setSelected(null), 650);
  }

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) setSelected(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [saving, selected]);

  if (!isAdmin || !selected || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[130] flex items-end justify-center bg-[#031d2b]/70 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !saving) setSelected(null);
    }}>
      <section data-inline-text-ignore role="dialog" aria-modal="true" aria-labelledby="inline-text-title" className="w-full rounded-t-2xl bg-white p-5 text-court-900 shadow-2xl sm:max-w-xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase text-[#0097a9]">Édition comme dans WordPress</p>
            <h2 id="inline-text-title" className="font-display text-2xl font-black">Modifier ce texte</h2>
          </div>
          <button type="button" onClick={() => setSelected(null)} disabled={saving} className="flex h-10 w-10 items-center justify-center rounded-full bg-court-50 hover:bg-court-100" aria-label="Fermer"><X className="h-5 w-5" /></button>
        </div>
        <label className="mt-5 grid gap-2 text-sm font-semibold">
          Texte affiché
          <textarea autoFocus rows={5} value={draft} onChange={(event) => setDraft(event.target.value)} className="resize-y rounded-lg border border-court-200 bg-white px-3 py-3 text-base leading-7 outline-none focus:border-court-500 focus:ring-2 focus:ring-court-500/20" />
        </label>
        <p className="mt-2 text-xs leading-5 text-ink-500">Le texte peut être modifié sans toucher à la mise en page ni au lien associé.</p>
        {message ? <p role="status" className="mt-4 rounded-lg bg-court-50 px-4 py-3 text-sm font-semibold">{message}</p> : null}
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button type="button" onClick={() => publish(selected.original, true)} disabled={saving} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-court-200 px-4 font-display text-sm font-bold hover:bg-court-50"><RotateCcw className="h-4 w-4" />Rétablir l’original</button>
          <button type="button" onClick={() => publish(draft)} disabled={saving} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#0097a9] px-5 font-display text-sm font-black text-white hover:bg-[#007f8f] disabled:opacity-60"><Save className="h-4 w-4" />{saving ? "Publication..." : "Publier ce texte"}</button>
        </div>
      </section>
    </div>,
    document.body
  );
}
