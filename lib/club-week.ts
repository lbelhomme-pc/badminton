export const frenchDayOrder = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"] as const;

export function toIsoDate(date: Date) {
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().slice(0, 10);
}

export function getCurrentClubWeek(today = new Date()) {
  const current = new Date(today);
  const day = current.getDay() || 7;
  const monday = new Date(current);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(current.getDate() - day + 1);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: toIsoDate(monday),
    end: toIsoDate(sunday),
    label: `${formatDisplayDate(monday)} - ${formatDisplayDate(sunday)}`
  };
}

export function formatDisplayDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(`${value}T12:00:00`) : value;
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(date);
}

export function formatFullDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(`${value}T12:00:00`) : value;
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "2-digit", month: "long" }).format(date);
}

export function dateForFrenchDay(dayLabel: string, weekStartIso: string) {
  const index = frenchDayOrder.indexOf(dayLabel.trim().toLowerCase() as (typeof frenchDayOrder)[number]);
  const monday = new Date(`${weekStartIso}T12:00:00`);
  if (index < 0) return toIsoDate(monday);

  const target = new Date(monday);
  target.setDate(monday.getDate() + index);
  return toIsoDate(target);
}
