"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { demoAdmin, demoMember, slots } from "@/lib/mock-data";
import type { Reservation, Role, ShuttleOrder, ShuttleProduct, SlotOccurrence, UserProfile } from "@/types/domain";

type LoginMode = "member" | "admin";

interface ClubStore {
  currentUser: UserProfile | null;
  reservations: Reservation[];
  orders: ShuttleOrder[];
  loginAs: (mode: LoginMode) => void;
  logout: () => void;
  reserveSlot: (slot: SlotOccurrence) => { ok: true; reservation: Reservation } | { ok: false; message: string };
  cancelReservation: (reservationId: string) => void;
  createShuttleOrder: (
    product: ShuttleProduct,
    quantity: number
  ) => { ok: true; order: ShuttleOrder } | { ok: false; message: string };
  placesTakenForSlot: (slotId: string) => number;
  hasRole: (role: string) => boolean;
}

const ClubContext = createContext<ClubStore | null>(null);

const storageKeys = {
  user: "badclub:user",
  reservations: "badclub:reservations",
  orders: "badclub:orders"
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function ClubProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [orders, setOrders] = useState<ShuttleOrder[]>([]);

  useEffect(() => {
    setCurrentUser(readJson<UserProfile | null>(storageKeys.user, null));
    setReservations(readJson<Reservation[]>(storageKeys.reservations, []));
    setOrders(readJson<ShuttleOrder[]>(storageKeys.orders, []));
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (currentUser) {
        window.localStorage.setItem(storageKeys.user, JSON.stringify(currentUser));
      } else {
        window.localStorage.removeItem(storageKeys.user);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKeys.reservations, JSON.stringify(reservations));
    }
  }, [reservations]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKeys.orders, JSON.stringify(orders));
    }
  }, [orders]);

  const loginAs = useCallback((mode: LoginMode) => {
    setCurrentUser(mode === "admin" ? demoAdmin : demoMember);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const placesTakenForSlot = useCallback(
    (slotId: string) => {
      return reservations.filter((reservation) => reservation.slotOccurrenceId === slotId && reservation.status === "confirmed")
        .length;
    },
    [reservations]
  );

  const reserveSlot = useCallback(
    (slot: SlotOccurrence) => {
      if (!currentUser) {
        return { ok: false as const, message: "Connectez-vous pour réserver ce créneau." };
      }

      if (currentUser.membershipStatus !== "active") {
        return { ok: false as const, message: "Votre adhésion doit être active pour réserver." };
      }

      if (slot.status !== "open") {
        return { ok: false as const, message: "Ce créneau n'est pas ouvert à la réservation." };
      }

      const alreadyReserved = reservations.some(
        (reservation) =>
          reservation.slotOccurrenceId === slot.id &&
          reservation.userId === currentUser.id &&
          reservation.status === "confirmed"
      );

      if (alreadyReserved) {
        return { ok: false as const, message: "Vous avez déjà une réservation sur ce créneau." };
      }

      const activeReservations = reservations.filter(
        (reservation) => reservation.userId === currentUser.id && reservation.status === "confirmed"
      );

      if (activeReservations.length >= 3) {
        return { ok: false as const, message: "Vous avez atteint la limite de 3 réservations actives." };
      }

      const taken = slot.registeredCount + placesTakenForSlot(slot.id);

      if (taken >= slot.capacityMax) {
        return { ok: false as const, message: "Ce créneau vient d'être complet." };
      }

      const reservation: Reservation = {
        id: `reservation-${Date.now()}`,
        slotOccurrenceId: slot.id,
        userId: currentUser.id,
        status: "confirmed",
        createdAt: new Date().toISOString()
      };

      setReservations((current) => [reservation, ...current]);
      return { ok: true as const, reservation };
    },
    [currentUser, placesTakenForSlot, reservations]
  );

  const cancelReservation = useCallback((reservationId: string) => {
    setReservations((current) =>
      current.map((reservation) =>
        reservation.id === reservationId ? { ...reservation, status: "cancelled" } : reservation
      )
    );
  }, []);

  const createShuttleOrder = useCallback(
    (product: ShuttleProduct, quantity: number) => {
      if (!currentUser) {
        return { ok: false as const, message: "Connectez-vous pour réserver des volants." };
      }

      if (quantity < 1) {
        return { ok: false as const, message: "Choisissez au moins un tube." };
      }

      const alreadyReserved = orders
        .filter((order) => order.productId === product.id && order.status !== "cancelled")
        .reduce((sum, order) => sum + order.quantity, 0);

      if (alreadyReserved + quantity > product.stockQuantity) {
        return { ok: false as const, message: "Stock insuffisant pour cette quantité." };
      }

      const order: ShuttleOrder = {
        id: `order-${Date.now()}`,
        userId: currentUser.id,
        productId: product.id,
        productLabel: `${product.brand} ${product.model}`,
        quantity,
        totalCents: product.priceCents * quantity,
        status: "to_pay",
        createdAt: new Date().toISOString()
      };

      setOrders((current) => [order, ...current]);
      return { ok: true as const, order };
    },
    [currentUser, orders]
  );

  const hasRole = useCallback(
    (role: string) => {
      return Boolean(currentUser?.roles.includes(role as Role));
    },
    [currentUser]
  );

  const value = useMemo<ClubStore>(
    () => ({
      currentUser,
      reservations,
      orders,
      loginAs,
      logout,
      reserveSlot,
      cancelReservation,
      createShuttleOrder,
      placesTakenForSlot,
      hasRole
    }),
    [cancelReservation, createShuttleOrder, currentUser, hasRole, loginAs, logout, orders, placesTakenForSlot, reservations, reserveSlot]
  );

  return <ClubContext.Provider value={value}>{children}</ClubContext.Provider>;
}

export function useClub() {
  const context = useContext(ClubContext);

  if (!context) {
    throw new Error("useClub must be used within ClubProvider");
  }

  return context;
}

export function useReservedSlots() {
  const { reservations } = useClub();

  return reservations
    .filter((reservation) => reservation.status === "confirmed")
    .map((reservation) => {
      const slot = slots.find((item) => item.id === reservation.slotOccurrenceId);
      return slot ? { reservation, slot } : null;
    })
    .filter(Boolean) as Array<{ reservation: Reservation; slot: SlotOccurrence }>;
}
