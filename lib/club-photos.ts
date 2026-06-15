export interface ClubPhotoSlot {
  id: "homeHero" | "clubLife" | "gymnaseAigremonts" | "trialSession";
  src: string | null;
  recommendedFile: string;
  alt: string;
  width: number;
  height: number;
}

export type ConfiguredClubPhotoSlot = ClubPhotoSlot & { src: string };

export const clubPhotoSlots = {
  homeHero: {
    id: "homeHero",
    src: null,
    recommendedFile: "/photos/accueil-badminton-cf2v41.webp",
    alt: "Joueurs adultes du CF2V41 en échange de badminton au Gymnase des Aigremonts",
    width: 1600,
    height: 1000
  },
  clubLife: {
    id: "clubLife",
    src: null,
    recommendedFile: "/photos/vie-club-cf2v41.webp",
    alt: "Bénévoles et adhérents adultes du CF2V41 pendant un moment convivial du club",
    width: 1400,
    height: 900
  },
  gymnaseAigremonts: {
    id: "gymnaseAigremonts",
    src: null,
    recommendedFile: "/photos/gymnase-aigremonts-cf2v41.webp",
    alt: "Terrains du Gymnase des Aigremonts préparés pour un créneau du CF2V41",
    width: 1400,
    height: 900
  },
  trialSession: {
    id: "trialSession",
    src: null,
    recommendedFile: "/photos/seance-essai-cf2v41.webp",
    alt: "Accueil d'un joueur débutant lors d'une séance d'essai badminton du CF2V41",
    width: 1400,
    height: 900
  }
} satisfies Record<ClubPhotoSlot["id"], ClubPhotoSlot>;

export function hasClubPhoto(slot: ClubPhotoSlot): slot is ConfiguredClubPhotoSlot {
  return typeof slot.src === "string" && slot.src.length > 0;
}
