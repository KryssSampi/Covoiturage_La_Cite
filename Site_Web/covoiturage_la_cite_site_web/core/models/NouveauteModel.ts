/**
 * NouveauteModel — Modèle pour les vidéos de nouveautés de la plateforme.
 * Supporte n'importe quelle source vidéo (YouTube, Vimeo, lien direct, etc.)
 */
export interface NouveauteModel {
  /** Identifiant unique (ex: "NVT-2026-00001") */
  id: string;
  /** Titre de la vidéo */
  title: string;
  /** URL complète de la vidéo (YouTube, Vimeo, mp4, etc.) */
  videoUrl: string;
  /** URL de la miniature (optionnel — générée automatiquement pour YouTube) */
  thumbnailUrl?: string;
  /** Date de publication ISO */
  createdAt: string;
}
