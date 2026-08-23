"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ImagePlus, Pencil, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { PublicClubSettings, PublicAppearanceSettings, PublicContentSettings } from "@/services/club.service";
import { uploadMediaAsset, upsertSiteSetting } from "@/services/supabase-data.service";

type EditorProps =
  | { section: "header"; appearance: PublicAppearanceSettings; content: PublicContentSettings }
  | { section: "footer"; settings: PublicClubSettings };

async function refreshPublicSite() {
  const supabase = createSupabaseBrowserClient();
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  if (!session?.access_token) return false;

  const response = await fetch("/api/revalidate-site", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.access_token}` }
  });
  return response.ok;
}

export function InlineLayoutEditor(props: EditorProps) {
  const { isAdmin, user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const appearance = props.section === "header" ? props.appearance : props.settings.appearance;
  const content = props.section === "header" ? props.content : props.settings.content;
  const [imageUrl, setImageUrl] = useState(props.section === "header" ? appearance.headerLogoUrl : appearance.footerImageUrl);
  const [imageAlt, setImageAlt] = useState(props.section === "header" ? appearance.headerLogoAlt : appearance.footerImageAlt);
  const [registrationLabel, setRegistrationLabel] = useState(content.headerRegistrationLabel);
  const [footerHeading, setFooterHeading] = useState(content.footerHeading);
  const [footerDescription, setFooterDescription] = useState(content.footerDescription);
  const [footerAddress, setFooterAddress] = useState(content.footerAddress);
  const [email, setEmail] = useState(props.section === "footer" ? props.settings.contact.email : "");
  const [phone, setPhone] = useState(props.section === "footer" ? props.settings.contact.phone : "");
  const [facebookUrl, setFacebookUrl] = useState(props.section === "footer" ? props.settings.contact.facebookUrl : "");
  const [instagramUrl, setInstagramUrl] = useState(props.section === "footer" ? props.settings.contact.instagramUrl : "");

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving && !uploading) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, saving, uploading]);

  async function chooseImage(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("Envoi de l’image en cours...");
    const result = await uploadMediaAsset({
      file,
      title: `${props.section === "header" ? "Logo du header" : "Image du footer"} - ${file.name}`,
      description: `Image modifiée directement depuis le ${props.section}.`,
      altText: imageAlt,
      informative: false,
      knownUsage: [props.section],
      uploadedBy: user?.id
    });
    setUploading(false);
    input.value = "";

    if (result.ok && "publicUrl" in result && result.publicUrl) {
      setImageUrl(result.publicUrl);
      setMessage("Image chargée. Cliquez sur « Publier » pour l’afficher sur le site.");
    } else {
      setMessage(result.message);
    }
  }

  async function save() {
    setSaving(true);
    setMessage("Publication des modifications...");

    const nextAppearance: PublicAppearanceSettings = {
      ...appearance,
      ...(props.section === "header"
        ? { headerLogoUrl: imageUrl.trim(), headerLogoAlt: imageAlt.trim() }
        : { footerImageUrl: imageUrl.trim(), footerImageAlt: imageAlt.trim() })
    };
    const nextContent: PublicContentSettings = {
      ...content,
      ...(props.section === "header"
        ? { headerRegistrationLabel: registrationLabel.trim() }
        : {
            footerHeading: footerHeading.trim(),
            footerDescription: footerDescription.trim(),
            footerAddress: footerAddress.trim()
          })
    };
    const requests = [
      upsertSiteSetting({ key: "appearance", value: { ...nextAppearance }, visibility: "public" }),
      upsertSiteSetting({ key: "content", value: { ...nextContent }, visibility: "public" })
    ];

    if (props.section === "footer") {
      requests.push(
        upsertSiteSetting({
          key: "contact",
          value: {
            email: email.trim(),
            phone: phone.trim(),
            generic_contacts: props.settings.contact.genericContacts.join(" / "),
            facebook_url: facebookUrl.trim(),
            instagram_url: instagramUrl.trim()
          },
          visibility: "public"
        })
      );
    }

    const results = await Promise.all(requests);
    const failed = results.find((result) => !result.ok);
    if (failed) {
      setSaving(false);
      setMessage(failed.message);
      return;
    }

    try {
      await refreshPublicSite();
    } catch {
      // L'enregistrement Supabase est déjà effectué ; router.refresh() retente
      // immédiatement la lecture, et le cache expirera également normalement.
    }
    router.refresh();
    setSaving(false);
    setMessage("Modifications publiées.");
    setTimeout(() => setOpen(false), 650);
  }

  if (!isAdmin) return null;

  const title = props.section === "header" ? "Modifier le header" : "Modifier le footer";
  const dialog = open ? (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-[#031d2b]/70 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !saving && !uploading) setOpen(false);
    }}>
      <section role="dialog" aria-modal="true" aria-labelledby={`inline-${props.section}-title`} className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-court-100 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase text-[#0097a9]">Modification directe</p>
            <h2 id={`inline-${props.section}-title`} className="font-display text-2xl font-black text-court-900">{title}</h2>
          </div>
          <button type="button" onClick={() => setOpen(false)} disabled={saving || uploading} className="flex h-10 w-10 items-center justify-center rounded-full bg-court-50 text-court-900 hover:bg-court-100" aria-label="Fermer">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-5 p-5">
          <ImageEditorField
            label={props.section === "header" ? "Logo du header" : "Image du footer"}
            imageUrl={imageUrl}
            imageAlt={imageAlt}
            uploading={uploading}
            onChoose={chooseImage}
            onAltChange={setImageAlt}
            onRemove={() => setImageUrl("")}
          />

          {props.section === "header" ? (
            <EditorInput label="Texte du bouton Inscriptions" value={registrationLabel} onChange={setRegistrationLabel} />
          ) : (
            <>
              <EditorInput label="Titre du footer" value={footerHeading} onChange={setFooterHeading} />
              <EditorTextarea label="Description" value={footerDescription} onChange={setFooterDescription} />
              <EditorInput label="Adresse affichée" value={footerAddress} onChange={setFooterAddress} />
              <div className="grid gap-4 sm:grid-cols-2">
                <EditorInput label="Email" type="email" value={email} onChange={setEmail} />
                <EditorInput label="Téléphone" value={phone} onChange={setPhone} />
                <EditorInput label="Lien Facebook" value={facebookUrl} onChange={setFacebookUrl} />
                <EditorInput label="Lien Instagram" value={instagramUrl} onChange={setInstagramUrl} />
              </div>
            </>
          )}

          {message ? <p role="status" className="rounded-lg bg-court-50 px-4 py-3 text-sm font-semibold text-court-800">{message}</p> : null}
        </div>

        <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-court-100 bg-white px-5 py-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => setOpen(false)} disabled={saving || uploading} className="h-11 rounded-lg border border-court-200 px-5 font-display text-sm font-bold text-court-900 hover:bg-court-50">Annuler</button>
          <button type="button" onClick={save} disabled={saving || uploading} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#0097a9] px-5 font-display text-sm font-black text-white hover:bg-[#007f8f] disabled:opacity-60">
            <Save className="h-4 w-4" aria-hidden="true" />
            {saving ? "Publication..." : "Publier les modifications"}
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
          setMessage(null);
          setOpen(true);
        }}
        className="absolute right-3 top-3 z-[60] hidden items-center gap-2 rounded-full border-2 border-white bg-[#0097a9] px-3 py-2 font-display text-xs font-black text-white shadow-[0_8px_22px_rgba(3,29,43,0.28)] hover:bg-[#007f8f]"
        aria-label={title}
      >
        <Pencil className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Modifier ici</span>
      </button>
      {typeof document !== "undefined" && dialog ? createPortal(dialog, document.body) : null}
    </>
  );
}

function ImageEditorField({ label, imageUrl, imageAlt, uploading, onChoose, onAltChange, onRemove }: {
  label: string;
  imageUrl: string;
  imageAlt: string;
  uploading: boolean;
  onChoose: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAltChange: (value: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-court-100 bg-court-50 p-4">
      <p className="font-display text-sm font-black text-court-900">{label}</p>
      <div className="mt-3 flex h-36 items-center justify-center overflow-hidden rounded-lg border border-court-100 bg-white p-3">
        {imageUrl ? <img src={imageUrl} alt={imageAlt} className="max-h-full max-w-full object-contain" /> : <span className="text-sm text-ink-500">Aucune image</span>}
      </div>
      <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#0097a9] px-4 py-3 font-display text-sm font-black text-white hover:bg-[#007f8f]">
        <ImagePlus className="h-4 w-4" aria-hidden="true" />
        {uploading ? "Envoi..." : "Choisir une image"}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml" disabled={uploading} onChange={onChoose} className="sr-only" />
      </label>
      {imageUrl ? <button type="button" onClick={onRemove} className="ml-3 text-sm font-bold text-red-700 hover:underline">Retirer</button> : null}
      <div className="mt-3">
        <EditorInput label="Description de l’image" value={imageAlt} onChange={onAltChange} />
      </div>
    </div>
  );
}

function EditorInput({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-court-900">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-lg border border-court-200 bg-white px-3 outline-none focus:border-court-500 focus:ring-2 focus:ring-court-500/20" />
    </label>
  );
}

function EditorTextarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-court-900">
      {label}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} className="min-h-24 rounded-lg border border-court-200 bg-white px-3 py-3 outline-none focus:border-court-500 focus:ring-2 focus:ring-court-500/20" />
    </label>
  );
}
