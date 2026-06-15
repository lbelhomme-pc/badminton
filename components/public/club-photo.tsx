import type { ConfiguredClubPhotoSlot } from "@/lib/club-photos";

interface ClubPhotoProps {
  slot: ConfiguredClubPhotoSlot;
  className?: string;
  priority?: boolean;
}

export function ClubPhoto({ slot, className = "", priority = false }: ClubPhotoProps) {
  return (
    <img
      src={slot.src}
      alt={slot.alt}
      width={slot.width}
      height={slot.height}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      className={`rounded-lg border border-court-200 object-cover shadow-soft ${className}`}
    />
  );
}
