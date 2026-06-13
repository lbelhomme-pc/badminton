"use client";

import Link from "next/link";
import { CalendarDays, Clock, MapPin, UserRound, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate, formatTime, slotStatusClass, slotStatusLabel, slotTypeLabel } from "@/lib/utils";
import type { SlotOccurrence } from "@/types/domain";

interface SlotCardProps {
  slot: SlotOccurrence;
  compact?: boolean;
}

export function SlotCard({ slot, compact = false }: SlotCardProps) {
  const taken = slot.registeredCount;
  const remaining = Math.max(slot.capacityMax - taken, 0);
  const canReserve = slot.status === "open" && remaining > 0;

  return (
    <Card className="group flex h-full flex-col p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Badge className={slotStatusClass(canReserve ? "open" : slot.status)}>
            {canReserve ? "Ouvert" : slotStatusLabel(slot.status)}
          </Badge>
          <h3 className="mt-3 text-lg font-black leading-tight text-court-900">{slot.title}</h3>
          <p className="mt-1 text-sm font-semibold text-court-600">{slotTypeLabel(slot.type)}</p>
        </div>
        <div className="rounded-lg bg-court-100 px-3 py-2 text-right">
          <p className="text-xl font-black text-court-900">{remaining}</p>
          <p className="text-[11px] font-semibold uppercase text-ink-500">places</p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-ink-500">
        <p className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-court-500" aria-hidden="true" />
          <span className="font-semibold text-court-900">{formatDate(slot.startsAt)}</span>
        </p>
        <p className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-court-500" aria-hidden="true" />
          {formatTime(slot.startsAt)} - {formatTime(slot.endsAt)}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-court-500" aria-hidden="true" />
          {slot.venueName}
        </p>
        {!compact ? (
          <>
            <p className="flex items-center gap-2">
              <UsersRound className="h-4 w-4 text-court-500" aria-hidden="true" />
              {taken}/{slot.capacityMax} inscrits · {slot.recommendedLevel}
            </p>
            <p className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-court-500" aria-hidden="true" />
              Responsable : {slot.managerName}
            </p>
          </>
        ) : null}
      </div>

      <div className="mt-auto flex flex-col gap-2 pt-5 sm:flex-row">
        {canReserve ? (
          <Link
            href="/reservation-creneau"
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-court-500 px-4 text-sm font-semibold text-white shadow-soft transition hover:bg-court-600"
          >
            Réserver ma place
          </Link>
        ) : (
          <span className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-100 px-4 text-sm font-semibold text-ink-500">
            Indisponible
          </span>
        )}
        <Link
          href={`/planning/${slot.id}`}
          className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-court-200 bg-white px-4 text-sm font-semibold text-court-900 transition hover:bg-court-100 sm:w-auto"
        >
          Détails
        </Link>
      </div>
    </Card>
  );
}
