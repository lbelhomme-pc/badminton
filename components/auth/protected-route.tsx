"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Card } from "@/components/ui/card";
import { getMemberAccessState, memberAccessMessage } from "@/lib/member-access";

interface ProtectedRouteProps {
  children: ReactNode;
  requireActiveMember?: boolean;
}

export function ProtectedRoute({ children, requireActiveMember = true }: ProtectedRouteProps) {
  const pathname = usePathname();
  const { loading, isAuthenticated, configured, profile, roles } = useAuth();
  const accessState = getMemberAccessState({ configured, loading, isAuthenticated, profile, roles });

  if (accessState === "loading" || accessState === "not_configured") {
    const message = memberAccessMessage(accessState);
    return <RouteMessage title={message.title} text={message.text} />;
  }

  if (accessState === "anonymous") {
    const message = memberAccessMessage(accessState);
    return (
      <RouteMessage
        title={message.title}
        text={message.text}
        href={`/connexion?redirect=${encodeURIComponent(pathname)}`}
        label="Se connecter"
      />
    );
  }

  if (requireActiveMember && accessState !== "allowed") {
    const message = memberAccessMessage(accessState);
    return <RouteMessage title={message.title} text={message.text} href="/contact" label="Contacter le club" />;
  }

  return <>{children}</>;
}

export function RouteMessage({ title, text, href, label }: { title: string; text: string; href?: string; label?: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Card className="p-6 text-center">
        <h1 className="text-3xl font-black text-court-900">{title}</h1>
        <p className="mt-3 text-ink-500">{text}</p>
        {href ? (
          <Link href={href} className="mt-6 inline-flex h-11 items-center rounded-lg bg-court-500 px-4 font-semibold text-white">
            {label}
          </Link>
        ) : null}
      </Card>
    </div>
  );
}
