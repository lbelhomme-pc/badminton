"use client";

import { useEffect } from "react";

const measurementId = "G-758T35VPML";
const consentKey = "cfvv41:cookie-consent:v1";
const scriptId = "cfvv-google-analytics-script";

type ConsentChoice = "accepted" | "refused";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function getConsentChoice(): ConsentChoice | null {
  try {
    const saved = window.localStorage.getItem(consentKey);
    if (!saved) return null;
    const parsed = JSON.parse(saved) as { choice?: ConsentChoice };
    return parsed.choice === "accepted" || parsed.choice === "refused" ? parsed.choice : null;
  } catch {
    return null;
  }
}

function removeAnalytics() {
  window.gtag?.("consent", "update", { analytics_storage: "denied" });
  document.getElementById(scriptId)?.remove();
}

function loadAnalytics() {
  if (document.getElementById(scriptId)) return;

  const script = document.createElement("script");
  script.id = scriptId;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args: unknown[]) => {
    window.dataLayer?.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", measurementId, { anonymize_ip: true });
}

export function GoogleAnalytics() {
  useEffect(() => {
    const applyConsent = (choice: ConsentChoice | null) => {
      if (choice === "accepted") loadAnalytics();
      if (choice === "refused") removeAnalytics();
    };

    applyConsent(getConsentChoice());

    const handleConsentChange = (event: Event) => {
      const choice = (event as CustomEvent<ConsentChoice>).detail;
      applyConsent(choice === "accepted" || choice === "refused" ? choice : null);
    };

    window.addEventListener("cfvv-cookie-consent-change", handleConsentChange);
    return () => window.removeEventListener("cfvv-cookie-consent-change", handleConsentChange);
  }, []);

  return null;
}
