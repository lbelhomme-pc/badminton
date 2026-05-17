"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { UserMenu } from "@/components/auth/user-menu";
import { ClubLogo } from "@/components/brand/club-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const primaryLinks = [
  { href: "/", label: "Accueil" },
  { href: "/creneaux", label: "Créneaux" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/commande-volants", label: "Volants" },
  { href: "/club", label: "Le club" },
  { href: "/contact", label: "Contact" }
];

const mobileLinks = [
  ...primaryLinks,
  { href: "/inscription", label: "S'inscrire" },
  { href: "/connexion", label: "Connexion" },
  { href: "/faq", label: "FAQ" },
  { href: "/classements", label: "Classements" },
  { href: "/espace-adherent", label: "Espace adhérent" }
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-court-200 bg-white/92 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Accueil du CFVV41">
          <ClubLogo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
          {primaryLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-semibold transition",
                isActive(item.href) ? "bg-court-100 text-court-900" : "text-ink-500 hover:bg-court-100 hover:text-court-900"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="block">
            <UserMenu />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </Button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-court-200 bg-white px-4 py-4 lg:hidden">
          <div className="grid gap-2">
            {mobileLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-3 text-sm font-semibold transition",
                  isActive(item.href) ? "bg-court-100 text-court-900" : "text-ink-500 hover:bg-court-100 hover:text-court-900"
                )}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
