/**
 * UserPreferencesModel — Préférences configurables par l'utilisateur
 *
 * SOURCE : Paramètres du compte (section "Mes préférences")
 * USAGE  : Algorithme de matching passager, affichage profil, filtres de recherche
 *
 * Ce modèle existe indépendamment de UserModel pour deux raisons :
 *  1. Il est lourd — on ne le charge que quand on en a besoin (matching, settings)
 *  2. Il est fréquemment mis à jour sans toucher au profil principal
 *
 * Reflète la table "preferences_utilisateur" en base de données.
 */

// ─── Sous-types ───────────────────────────────────────────────────────────────

export type ConversationLevelPref = 'quiet' | 'moderate' | 'chatty';
export type BaggageLevel          = 'none' | 'light' | 'heavy';
export type LanguagePreference    = 'fr' | 'en' | 'bilingual';
export type PaymentMethodPref     = 'cash' | 'interac';
export type MusicGenre =
  | 'pop' | 'rock' | 'rap' | 'rnb' | 'classique'
  | 'jazz' | 'electro' | 'country' | 'indifferent';

// ─── Modèle principal ─────────────────────────────────────────────────────────

export interface UserPreferencesModel {

  // ── Identité ──────────────────────────────────────────────────────────────
  id: string;
  /** ID de l'utilisateur propriétaire (UserModel) */
  userId: string;

  // ── COMPORTEMENT EN TRAJET ─────────────────────────────────────────────────
  /** Niveau de conversation souhaité pendant le trajet */
  conversationLevel: ConversationLevelPref;

  /** Le passager écoute-t-il de la musique en trajet? */
  musicAccepted: boolean;
  /** Genre musical préféré (si musicAccepted = true) */
  musicGenre?: MusicGenre;

  /** Le passager fume-t-il réellement? (≠ smokingAccepted qui est une tolérance) */
  smokesRegularly: boolean;
  /** Le passager tolère-t-il la fumée dans le véhicule? */
  smokingAccepted: boolean;

  /** Le passager voyage-t-il avec un animal? */
  hasPets: boolean;
  /** Le passager accepte-t-il les animaux d'autres passagers? */
  petsAccepted: boolean;

  /** Niveau de bagages habituel du passager */
  typicalBaggageLevel: BaggageLevel;

  // ── PAIEMENT ──────────────────────────────────────────────────────────────
  /** Méthodes de paiement que l'utilisateur peut utiliser */
  acceptedPaymentMethods: PaymentMethodPref[];
  /** Méthode préférée (si plusieurs disponibles) */
  preferredPaymentMethod?: PaymentMethodPref;

  // ── LANGUE ────────────────────────────────────────────────────────────────
  /** Langue(s) parlée(s) et préférence de communication pendant le trajet */
  languagePreference: LanguagePreference;

  // ── RECHERCHE DE TRAJET (côté passager) ──────────────────────────────────
  /** Rayon de recherche autour du point de départ, en mètres */
  defaultDepartureRadiusMeters: number;
  /** Rayon de recherche autour du point d'arrivée, en mètres */
  defaultArrivalRadiusMeters: number;
  /** Tolérance horaire par défaut (±minutes) */
  defaultTimeToleranceMinutes: number;
  /** Prix maximum par trajet accepté (null = aucune limite) */
  defaultMaxPrice?: number;

  // ── EXIGENCES DE SÉCURITÉ (côté passager) ────────────────────────────────
  /** Le passager exige-t-il un conducteur avec profil vérifié? */
  requireVerifiedDriver: boolean;
  /** GoScore minimum requis du conducteur (0 = aucun) */
  minDriverGoScore: number;
  /** Note moyenne minimale requise du conducteur (1.0–5.0) */
  minDriverRating: number;

  // ── EXIGENCES DU CONDUCTEUR (côté conducteur) ────────────────────────────
  /** GoScore minimum requis des passagers (0 = aucun) */
  minPassengerGoScore: number;
  /** Le conducteur accepte-t-il les passagers avec bagages? */
  baggagePolicy: BaggageLevel;
  /** Le conducteur exige-t-il une présentation du passager? */
  requirePassengerMessage: boolean;

  // ── NOTIFICATIONS ─────────────────────────────────────────────────────────
  notifyNewMatchingTrips: boolean;
  notifyReservationUpdates: boolean;
  notifyMessages: boolean;
  notifyGoBoard: boolean;

  // ── CONFIDENTIALITÉ ───────────────────────────────────────────────────────
  showPhoneNumber: boolean;
  showLastName: boolean;
  /** Consentement pour le suivi d'affinité */
  allowAffinityTracking: boolean;

  // ── METADATA ──────────────────────────────────────────────────────────────
  createdAt: string;
  updatedAt: string;
}

// ─── Valeurs par défaut ───────────────────────────────────────────────────────

export const DEFAULT_USER_PREFERENCES_EXTENDED: Omit<UserPreferencesModel, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  conversationLevel:            'moderate',
  musicAccepted:                true,
  musicGenre:                   'indifferent',
  smokesRegularly:              false,
  smokingAccepted:              false,
  hasPets:                      false,
  petsAccepted:                 false,
  typicalBaggageLevel:          'light',
  acceptedPaymentMethods:       ['cash', 'interac'],
  preferredPaymentMethod:       'interac',
  languagePreference:           'bilingual',
  defaultDepartureRadiusMeters: 800,
  defaultArrivalRadiusMeters:   800,
  defaultTimeToleranceMinutes:  30,
  defaultMaxPrice:              undefined,
  requireVerifiedDriver:        false,
  minDriverGoScore:             0,
  minDriverRating:              3.5,
  minPassengerGoScore:          0,
  baggagePolicy:                'light',
  requirePassengerMessage:      false,
  notifyNewMatchingTrips:       true,
  notifyReservationUpdates:     true,
  notifyMessages:               true,
  notifyGoBoard:                true,
  showPhoneNumber:              false,
  showLastName:                 true,
  allowAffinityTracking:        true,
};
