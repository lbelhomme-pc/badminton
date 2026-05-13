"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || navigatorWithStandalone.standalone === true;
}

export function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);

  const isIos = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    if (isStandalone() || window.localStorage.getItem("cfvv41-pwa-dismissed") === "true") {
      return;
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);

    const fallbackTimer = window.setTimeout(() => {
      if (isIos && !isStandalone()) {
        setShowIosHint(true);
        setVisible(true);
      }
    }, 1400);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.clearTimeout(fallbackTimer);
    };
  }, [isIos]);

  async function install() {
    if (installEvent) {
      await installEvent.prompt();
      await installEvent.userChoice;
      setInstallEvent(null);
      setVisible(false);
      return;
    }

    setShowIosHint(true);
  }

  function dismiss() {
    window.localStorage.setItem("cfvv41-pwa-dismissed", "true");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-[4.6rem] z-50 md:hidden">
      <div className="rounded-lg border border-court-200 bg-white p-3 shadow-lift">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-court-100 text-court-600">
            <Download className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-black text-court-900">Installer l'app CFVV41</p>
            <p className="mt-1 text-sm leading-5 text-ink-500">
              Accès rapide aux créneaux, réservations et infos du club.
            </p>
            {showIosHint && !installEvent ? (
              <p className="mt-2 rounded-lg bg-court-50 px-3 py-2 text-xs font-semibold leading-5 text-ink-600">
                Sur iPhone : bouton Partager, puis Ajouter à l'écran d'accueil.
              </p>
            ) : null}
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={install}>
                Installer
              </Button>
              <Button size="sm" variant="ghost" onClick={dismiss}>
                Plus tard
              </Button>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-lg p-2 text-ink-500 transition hover:bg-court-100 hover:text-court-900"
            aria-label="Masquer l'installation"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
