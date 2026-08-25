"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, Settings2 } from "lucide-react";

const consentKey = "cfvv41:cookie-consent:v1";
type ConsentChoice = "accepted" | "refused";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(consentKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { choice?: ConsentChoice };
        if (parsed.choice === "accepted" || parsed.choice === "refused") {
          document.documentElement.dataset.cookieConsent = parsed.choice;
        }
      } catch {
        window.localStorage.removeItem(consentKey);
      }
    }
    setVisible(!window.localStorage.getItem(consentKey));
    const reopen = () => setVisible(true);
    window.addEventListener("cfvv-cookie-preferences-open", reopen);
    return () => window.removeEventListener("cfvv-cookie-preferences-open", reopen);
  }, []);

  function choose(choice: ConsentChoice) {
    window.localStorage.setItem(consentKey, JSON.stringify({ choice, savedAt: new Date().toISOString() }));
    document.documentElement.dataset.cookieConsent = choice;
    window.dispatchEvent(new CustomEvent("cfvv-cookie-consent-change", { detail: choice }));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[110] mx-auto max-w-4xl rounded-2xl border border-[#00a8bc]/40 bg-[#031d2b] p-5 text-white shadow-[0_20px_55px_rgba(3,29,43,0.45)] sm:bottom-5 sm:p-6" role="dialog" aria-modal="false" aria-labelledby="cookie-consent-title">
      <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex gap-4">
          <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0097a9] sm:flex"><Cookie className="h-5 w-5" aria-hidden="true" /></span>
          <div>
            <h2 id="cookie-consent-title" className="font-display text-xl font-black">Votre choix concernant les cookies</h2>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              Le site utilise les éléments indispensables à son fonctionnement. Vous pouvez accepter ou refuser les contenus tiers facultatifs, notamment la mesure d'audience Google Analytics et la boutique intégrée HelloAsso.
            </p>
            <Link href="/cookies" className="mt-2 inline-flex text-sm font-bold text-[#4dd6e6] underline underline-offset-2">En savoir plus et gérer mes préférences</Link>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-1">
          <button type="button" onClick={() => choose("accepted")} className="min-h-11 rounded-lg bg-[#0097a9] px-5 font-display text-sm font-black text-white hover:bg-[#00a8bc]">Tout accepter</button>
          <button type="button" onClick={() => choose("refused")} className="min-h-11 rounded-lg border border-white/45 bg-transparent px-5 font-display text-sm font-black text-white hover:bg-white/10">Refuser le facultatif</button>
        </div>
      </div>
    </div>
  );
}

export function CookieSettingsButton() {
  function reopen() {
    window.localStorage.removeItem(consentKey);
    window.dispatchEvent(new Event("cfvv-cookie-preferences-open"));
  }

  return (
    <button type="button" onClick={reopen} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-court-200 bg-white px-4 font-display text-sm font-black text-court-900 hover:bg-court-50">
      <Settings2 className="h-4 w-4" aria-hidden="true" /> Modifier mon choix
    </button>
  );
}
