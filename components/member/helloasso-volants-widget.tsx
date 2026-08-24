"use client";

import { useEffect, useState } from "react";
import { ExternalLink, LockKeyhole, Settings2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const widgetUrl = "https://www.helloasso.com/associations/les-fous-du-volant-vendomois/boutiques/volants/widget";
const shopUrl = "https://www.helloasso.com/associations/les-fous-du-volant-vendomois/boutiques/volants";
const consentKey = "cfvv41:cookie-consent:v1";

function hasThirdPartyConsent() {
  try {
    const saved = window.localStorage.getItem(consentKey);
    if (!saved) return false;
    const parsed = JSON.parse(saved) as { choice?: string };
    return parsed.choice === "accepted";
  } catch {
    return false;
  }
}

export function HelloAssoVolantsWidget() {
  const [allowed, setAllowed] = useState(false);
  const [height, setHeight] = useState(750);

  useEffect(() => {
    setAllowed(hasThirdPartyConsent());
    const onConsentChange = (event: Event) => {
      const choice = (event as CustomEvent<string>).detail;
      setAllowed(choice === "accepted");
    };
    window.addEventListener("cfvv-cookie-consent-change", onConsentChange);
    return () => window.removeEventListener("cfvv-cookie-consent-change", onConsentChange);
  }, []);

  useEffect(() => {
    if (!allowed) return;
    const resizeWidget = (event: MessageEvent) => {
      if (event.origin !== "https://www.helloasso.com") return;
      const requestedHeight = Number(event.data?.height);
      if (Number.isFinite(requestedHeight) && requestedHeight >= 400 && requestedHeight <= 4000) {
        setHeight(Math.ceil(requestedHeight));
      }
    };
    window.addEventListener("message", resizeWidget);
    return () => window.removeEventListener("message", resizeWidget);
  }, [allowed]);

  function openPreferences() {
    window.dispatchEvent(new Event("cfvv-cookie-preferences-open"));
  }

  return (
    <Card className="overflow-hidden border-court-200 shadow-[0_18px_55px_rgba(3,37,51,0.08)]">
      <div className="flex flex-col gap-4 border-b border-court-100 bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-display text-xs font-black uppercase tracking-wide text-[#007f8f]">Paiement officiel</p>
          <h2 className="mt-1 text-2xl font-black text-court-900">Boutique HelloAsso</h2>
          <p className="mt-1 text-sm leading-6 text-ink-600">Toute la commande se fait dans le formulaire ci-dessous.</p>
        </div>
        <a href={shopUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-court-200 bg-court-50 px-4 font-display text-sm font-black text-court-900 transition hover:border-court-400 hover:bg-court-100">
          Ouvrir séparément <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>

      {allowed ? (
        <iframe
          id="helloasso-volants-widget"
          title="Boutique HelloAsso des volants du CFVV"
          src={widgetUrl}
          scrolling="auto"
          style={{ width: "100%", height: `${height}px`, border: 0 }}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <div className="grid min-h-72 place-items-center bg-white p-6 text-center">
          <div className="max-w-xl">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-court-100 text-court-800"><LockKeyhole className="h-5 w-5" aria-hidden="true" /></span>
            <h3 className="mt-4 text-xl font-black text-court-900">Autorisation nécessaire pour afficher HelloAsso</h3>
            <p className="mt-3 text-sm leading-6 text-ink-600">Le formulaire de paiement est fourni par un service tiers. Acceptez les contenus facultatifs pour l’afficher ici, ou ouvrez directement la boutique dans un nouvel onglet.</p>
            <button type="button" onClick={openPreferences} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0097a9] px-5 font-display text-sm font-black text-white hover:bg-[#007f8f]">
              <Settings2 className="h-4 w-4" aria-hidden="true" /> Gérer mes préférences
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
