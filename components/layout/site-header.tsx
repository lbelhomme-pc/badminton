"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { UserMenu } from "@/components/auth/user-menu";
import { ClubLogo } from "@/components/brand/club-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PublicAppearanceSettings, PublicContentSettings } from "@/services/club.service";

const primaryLinks = [
  { href: "/", label: "Accueil" },
  { href: "/creneaux", label: "Créneaux" },
  { href: "/club/bureau-benevoles", label: "Le Bureau" },
  { href: "/agenda", label: "Agenda" },
  { href: "/club", label: "Le Club" },
  { href: "/inscription", label: "Inscriptions 2026-2027" },
  { href: "/contact", label: "Contact" }
];

const mobileLinks = [
  ...primaryLinks,
  { href: "/connexion", label: "Espace adhérent" },
  { href: "/inscription", label: "Nous rejoindre" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/lieux-acces", label: "Lieux et accès" },
  { href: "/faq", label: "FAQ" }
];

export function SiteHeader({ appearance, content }: { appearance: PublicAppearanceSettings; content: PublicContentSettings }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement | null>(null);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";

    const matches = pathname === href || pathname.startsWith(`${href}/`);
    if (!matches) return false;

    return !primaryLinks.some((item) => {
      if (item.href === href || item.href === "/") return false;
      if (!item.href.startsWith(`${href}/`)) return false;
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    });
  }

  useEffect(() => {
    if (!mobileOpen) return;

    firstMobileLinkRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-[0_6px_18px_rgba(2,24,35,0.08)]">
      <div className="mx-auto flex min-h-[104px] max-w-[1180px] items-center justify-between gap-5 px-5 lg:px-8">
        <Link href="/" prefetch={false} className="flex min-w-0 items-center gap-3" aria-label="Accueil du CFVV">
          <ClubLogo compact priority src={appearance.headerLogoUrl} alt={appearance.headerLogoAlt} />
        </Link>

        <nav className="hidden items-center gap-5 xl:gap-7 lg:flex" aria-label="Navigation principale">
          {primaryLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "relative whitespace-nowrap px-1 py-3 font-display text-[13px] font-black text-[#071b27] transition motion-reduce:transition-none",
                "after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:origin-left after:rounded-full after:bg-[#0097a9] after:transition-transform",
                isActive(item.href) ? "text-[#0097a9] after:scale-x-100" : "after:scale-x-0 hover:text-[#0097a9] hover:after:scale-x-100"
              )}
            >
              {item.href === "/inscription" ? content.headerRegistrationLabel : item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <UserMenu />
          </div>
          <Button
            ref={menuButtonRef}
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-main-menu"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </Button>
        </div>
      </div>

      {mobileOpen ? (
        <nav
          id="mobile-main-menu"
          aria-label="Navigation principale mobile"
          className="max-h-[calc(100vh-6.5rem)] overflow-y-auto border-t border-slate-200 bg-white px-5 py-4 shadow-soft lg:hidden"
        >
          <div className="grid gap-2">
            {mobileLinks.map((item, index) => (
              <Link
                key={item.href}
                ref={index === 0 ? firstMobileLinkRef : undefined}
                href={item.href}
                prefetch={false}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-3 font-display text-base font-bold transition motion-reduce:transition-none",
                  isActive(item.href) ? "bg-court-100 text-court-900" : "text-ink-600 hover:bg-court-100 hover:text-court-900"
                )}
                onClick={() => setMobileOpen(false)}
              >
                {item.href === "/inscription" ? content.headerRegistrationLabel : item.label}
              </Link>
            ))}
            <div className="mt-3 border-t border-court-200 pt-3 sm:hidden">
              <UserMenu />
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
