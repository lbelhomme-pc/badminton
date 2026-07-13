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
    recommendedFile: "/photos/accueil-badminton-cfvv.webp",
    alt: "Joueurs adultes du CFVV en Ã©change de badminton au Gymnase des Aigremonts",
    width: 1600,
    height: 1000
  },
  clubLife: {
    id: "clubLife",
    src: null,
    recommendedFile: "/photos/vie-club-cfvv.webp",
    alt: "BÃ©nÃ©voles et adhÃ©rents adultes du CFVV pendant un moment convivial du club",
    width: 1400,
    height: 900
  },
  gymnaseAigremonts: {
    id: "gymnaseAigremonts",
    src: null,
    recommendedFile: "/photos/gymnase-aigremonts-cfvv.webp",
    alt: "Terrains du Gymnase des Aigremonts prÃ©parÃ©s pour un crÃ©neau du CFVV",
    width: 1400,
    height: 900
  },
  trialSession: {
    id: "trialSession",
    src: null,
    recommendedFile: "/photos/seance-essai-cfvv.webp",
    alt: "Accueil d'un joueur dÃ©butant lors d'une sÃ©ance d'essai badminton du CFVV",
    width: 1400,
    height: 900
  }
} satisfies Record<ClubPhotoSlot["id"], ClubPhotoSlot>;

export function hasClubPhoto(slot: ClubPhotoSlot): slot is ConfiguredClubPhotoSlot {
  return typeof slot.src === "string" && slot.src.length > 0;
}
