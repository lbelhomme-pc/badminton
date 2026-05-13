export type Role =
  | "visitor"
  | "member"
  | "coach"
  | "slot_manager"
  | "shuttle_manager"
  | "admin"
  | "super_admin";

export type SlotType =
  | "free_play"
  | "youth_training"
  | "adult_training"
  | "competitive_training"
  | "beginner_course"
  | "interclub"
  | "tournament"
  | "camp"
  | "special_event";

export type SlotStatus = "open" | "full" | "cancelled" | "competition_reserved" | "closed";

export type ReservationStatus = "confirmed" | "cancelled" | "admin_cancelled";

export type ShuttleOrderStatus =
  | "pending"
  | "reserved"
  | "to_pay"
  | "paid"
  | "picked_up"
  | "cancelled";

export type RankingVisibility = "hidden" | "limited" | "members" | "public";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  roles: Role[];
  membershipStatus: "pending" | "active" | "inactive" | "former";
  consentShowName: boolean;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  mapUrl: string;
  accessNotes: string;
}

export interface SlotOccurrence {
  id: string;
  title: string;
  type: SlotType;
  date: string;
  startsAt: string;
  endsAt: string;
  venueId: string;
  venueName: string;
  address: string;
  managerName: string;
  recommendedLevel: string;
  audience: string;
  courtsCount: number;
  capacityMax: number;
  registeredCount: number;
  status: SlotStatus;
  cancellationReason?: string;
}

export interface Reservation {
  id: string;
  slotOccurrenceId: string;
  userId: string;
  status: ReservationStatus;
  createdAt: string;
}

export interface ShuttleProduct {
  id: string;
  brand: string;
  model: string;
  description: string;
  priceCents: number;
  stockQuantity: number;
  lowStockThreshold: number;
  imageTone: "green" | "blue" | "yellow";
}

export interface ShuttleOrder {
  id: string;
  userId: string;
  productId: string;
  productLabel: string;
  quantity: number;
  totalCents: number;
  status: ShuttleOrderStatus;
  createdAt: string;
}

export interface Ranking {
  id: string;
  displayName: string;
  category: string;
  singleRank: string;
  doubleRank: string;
  mixedRank: string;
  progression: string;
  team: string;
  visibility: RankingVisibility;
}

export interface ClubEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  description: string;
}

export interface NewsPost {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  publishedAt: string;
}
