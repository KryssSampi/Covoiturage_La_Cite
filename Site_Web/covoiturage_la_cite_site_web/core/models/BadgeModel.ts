/**
 * BadgeModel — Modèle unifié pour les badges de gamification.
 *
 * SOURCE UNIQUE DE VÉRITÉ pour l'affichage et les règles des badges.
 * Chaque badge est stocké en DB JSON (tests/db/badges.json).
 * Les UserStats ne référencent que les IDs.
 */

// ─── Catégories de badges ────────────────────────────────────────────────────

export type BadgeCategorie =
  | 'trajets'
  | 'eco'
  | 'communaute'
  | 'performance'
  | 'special';

// ─── Clés d'icônes ───────────────────────────────────────────────────────────

export type BadgeIconKey =
  | 'FaCircleCheck'
  | 'FaCar'
  | 'FaGaugeHigh'
  | 'FaSeedling'
  | 'FaMedal'
  | 'FaStar'
  | 'FaShareNodes'
  | 'FaLeaf'
  | 'FaLock';

// ─── Modèle principal ────────────────────────────────────────────────────────

export interface BadgeModel {
  /** Identifiant unique, ex: "badge-confirme" */
  id: string;
  /** Code interne court, ex: "confirme" */
  code: string;
  /** Nom affiché, ex: "Confirmé" */
  nom: string;
  /** Description courte, ex: "6–20 trajets complétés" */
  description: string;
  /** Clé d'icône React Icons (fa6) utilisée côté UI */
  iconKey: BadgeIconKey;
  /** Couleur hexadécimale de l'icône, ex: "#0aad6a" */
  iconColor: string;
  /** Catégorie du badge */
  categorie: BadgeCategorie;
  /** Seuil numérique pour obtention (ex: 6 pour 6 trajets) */
  seuil: number;
  /** Unité du seuil pour affichage (ex: "trajets", "km CO₂", "%") */
  seuilUnite: string;
  /** Points de réputation requis (optionnel) */
  pointsReputationRequis?: number;
  /** Texte de récompense affiché lors de l'obtention */
  recompenseTexte: string;
  /** Ordre de tri pour l'affichage en grille */
  ordre: number;
}
