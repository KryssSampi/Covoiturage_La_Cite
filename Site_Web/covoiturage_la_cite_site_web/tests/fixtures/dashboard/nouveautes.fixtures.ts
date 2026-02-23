/**
 * @file nouveautes.fixtures.ts
 * @description Données éditoriales pour la section Nouveautés (carrousel YouTube).
 * Ces données sont éditoriales — elles peuvent rester statiques ou être gérées
 * via un CMS/panneau admin.
 *
 * TODO (optionnel): GET /api/admin/nouveautes
 *   Si les vidéos doivent être modifiables sans redéploiement.
 */

export interface NouveauteVideo {
  /** Identifiant YouTube de la vidéo (ex: "cwfZmKuM3a4") */
  youtubeId: string;
  /** Titre descriptif pour l'accessibilité (aria-label) */
  title: string;
}

export const NOUVEAUTE_VIDEOS: NouveauteVideo[] = [
  { youtubeId: "cwfZmKuM3a4", title: "Nouveauté Cité-Voiturage #1" },
  { youtubeId: "IKcxlaiH8m0", title: "Nouveauté Cité-Voiturage #2" },
  { youtubeId: "okkVK6-e1yA", title: "Nouveauté Cité-Voiturage #3" },
  { youtubeId: "hTgk2Rs99b0", title: "Nouveauté Cité-Voiturage #4" },
];
