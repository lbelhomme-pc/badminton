export type ClubPhotoKey = "homeHero" | "clubLife" | "gymnaseAigremonts" | "trialSession";

export interface ClubPhoto {
  id: ClubPhotoKey;
  src: string;
  alt: string;
  credit?: string;
}

export interface ConfiguredClubPhotoSlot extends ClubPhoto {
  width: number;
  height: number;
}

export const clubPhotoSlots: Record<ClubPhotoKey, ConfiguredClubPhotoSlot> = {
  homeHero: {
    id: "homeHero",
    src: "",
    alt: "Joueurs adultes du CFVV en échange de badminton au Gymnase des Aigremonts",
    width: 1400,
    height: 900
  },
  clubLife: {
    id: "clubLife",
    src: "",
    alt: "Bénévoles et adhérents adultes du CFVV pendant un moment convivial du club",
    width: 1200,
    height: 900
  },
  gymnaseAigremonts: {
    id: "gymnaseAigremonts",
    src: "",
    alt: "Terrains du Gymnase des Aigremonts préparés pour un créneau du CFVV",
    width: 1200,
    height: 900
  },
  trialSession: {
    id: "trialSession",
    src: "",
    alt: "Accueil d'un joueur débutant lors d'une séance d'essai badminton du CFVV",
    width: 1200,
    height: 900
  }
};

export const clubPhotos = clubPhotoSlots;

export function getClubPhoto(key: ClubPhotoKey) {
  return clubPhotoSlots[key];
}

export function hasClubPhoto(slot: ConfiguredClubPhotoSlot | null | undefined) {
  return Boolean(slot?.src);
}
