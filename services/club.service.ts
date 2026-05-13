import { events, ffbadRegistrationUrl, rankings, shuttleProducts, slots, venues } from "@/lib/mock-data";

export function getUpcomingSlots() {
  return [...slots].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function getOpenSlots() {
  return getUpcomingSlots().filter((slot) => slot.status === "open");
}

export function getSlotById(id: string) {
  return slots.find((slot) => slot.id === id);
}

export function getVenues() {
  return venues;
}

export function getShuttleProducts() {
  return shuttleProducts;
}

export function getRankings() {
  return rankings;
}

export function getEvents() {
  return events;
}

export function getFfbadRegistrationUrl() {
  return ffbadRegistrationUrl;
}
