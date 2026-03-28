/**
 * UserModel — Modèle unifié pour les utilisateurs
 * Fusion de : UserModel (domain), UserProfile (dashboard), UserMiniProfile (planner),
 *             TripDriver (trajets), ConducteurInfo + PassagerInfo (trajet-en-cours)
 *
 * SOURCE UNIQUE DE VÉRITÉ pour toute entité utilisateur.
 */

// ─── Rôles ────────────────────────────────────────────────────────────────────

export type UserRole = 'passenger' | 'driver' | 'admin';

export type ConversationLevel = 'quiet' | 'moderate' | 'chatty';

// ─── Sous-modèles ─────────────────────────────────────────────────────────────

/** Profil spécifique au rôle de conducteur */
export interface DriverProfile {
  /** Statut de validation du dossier conducteur */
  validationStatus: 'approved' | 'pending' | 'rejected';
  /** Points de réputation accumulés */
  reputationPoints: number;
  /** Note moyenne reçue comme conducteur (1.0–5.0) */
  averageRating: number;
  /** Nombre total de trajets effectués comme conducteur */
  totalTripsAsDriver: number;
  /** CO2 économisé en kg grâce au covoiturage */
  co2SavedKg: number;
  /** Taux d'annulation (0.05 = 5%) */
  cancellationRate: number;
  /** Score de ponctualité 0–100 (calculé depuis user_stats) */
  punctualityScore: number;
  /** Nombre de fois absent comme conducteur (no-show) */
  noShowCount: number;
}

/** Profil spécifique au rôle de passager */
export interface PassengerProfile {
  /** Note moyenne reçue comme passager (1.0–5.0) */
  averageRating: number;
  /** Nombre total de trajets effectués comme passager */
  totalTripsAsPassenger: number;
  /** CO2 économisé en kg grâce au covoiturage */
  co2SavedKg: number;
  /** Score de ponctualité 0–100 (calculé depuis user_stats) */
  punctualityScore: number;
  /** Nombre de no-shows comme passager */
  noShowCount: number;
}

/** Préférences de l'utilisateur */
export interface UserPreferences {
  musicAccepted: boolean;
  petsAccepted: boolean;
  smokingAccepted: boolean;
  conversationLevel: ConversationLevel;
}

// ─── Modèle principal ─────────────────────────────────────────────────────────

/**
 * UserModel — Modèle principal pour un utilisateur
 * Reflète la table "users" enrichie de ses données de profil
 */
export interface UserModel {
  // ── Identité ──────────────────────────────────────────────────────────────
  /** Identifiant unique, ex: "USR-2026-00001" */
  id: string;
  /** Adresse email institutionnelle */
  email: string;
  /** Prénom */
  firstName: string;
  /** Nom de famille */
  lastName: string;
  /** Initiales calculées, ex: "SL" pour Sophie Leclerc */
  initials: string;
  /** URL de la photo de profil */
  avatarUrl?: string;
  /** Numéro de téléphone */
  phone?: string;

  // ── Rôle & permissions ────────────────────────────────────────────────────
  role: UserRole;
  /** L'utilisateur peut-il activer le mode conducteur */
  canBeDriver: boolean;
  /** Profil vérifié (documents validés) */
  profileVerified: boolean;
  /** Compte actif */
  isActive: boolean;

  // ── Profils spécialisés ───────────────────────────────────────────────────
  /** Présent uniquement si l'utilisateur est conducteur */
  driverProfile?: DriverProfile;
  /** Toujours présent (tout utilisateur peut être passager) */
  passengerProfile: PassengerProfile;

  // ── Préférences ───────────────────────────────────────────────────────────
  preferences: UserPreferences;

  // ── Gamification ──────────────────────────────────────────────────────────
  /** Score GoBoard (réputation gamifiée) */
  goScore: number;
  /** IDs des badges obtenus */
  badgeIds: string[];

  // ── Préférences étendues ───────────────────────────────────────────────────
  /** FK vers UserPreferencesModel — null = préférences par défaut */
  preferencesId?: string;

  // ── Localisation temps réel ───────────────────────────────────────────────
  /**
   * Position GPS actuelle — mise à jour en temps réel pendant un trajet actif.
   * null si l'utilisateur n'a pas activé le suivi ou n'est pas en trajet.
   */
  currentLocation?: { lat: number; lng: number } | null;

  // ── Metadata ──────────────────────────────────────────────────────────────
  createdAt: string;
  updatedAt: string;
}

// ─── Valeurs par défaut ───────────────────────────────────────────────────────

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  musicAccepted: true,
  petsAccepted: false,
  smokingAccepted: false,
  conversationLevel: 'moderate',
};
