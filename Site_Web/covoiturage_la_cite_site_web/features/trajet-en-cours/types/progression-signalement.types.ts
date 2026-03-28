// ─────────────────────────────────────────────
// Types pour la progression du trajet et le signalement
// ─────────────────────────────────────────────
import type { ReactNode } from 'react';

export type StatutEtape = 'fait' | 'actif' | 'en_attente';

export interface EtapeTrajet {
  id: string;
  nom: string;
  ville: string;
  icone: ReactNode;
  tempsSecondes: number; // secondes depuis le départ pour atteindre cette étape
  distanceKm: number;    // distance cumulée depuis le départ
}

export interface TrajetProgressionFixture {
  id: string;
  labelDepart: string;
  labelArrivee: string;
  dureeTotaleSecondes: number;
  distanceTotaleKm: number;
  etapes: EtapeTrajet[];
}

export interface ProgressionCalculee {
  pourcentage: number;
  distanceParcourueKm: number;
  distanceRestanteKm: number;
  dureeRestanteSecondes: number;
  etaTexte: string;
  statutsEtapes: StatutEtape[];
  etapeActuelleIndex: number;
  estTermine: boolean;
}

export interface ProgressionSectionProps {
  fixture: TrajetProgressionFixture;
  /**
   * État de la carte temps réel — quand fourni, la progression est synchronisée avec TrajetMap.
   * La simulation interne (useProgression) est suspendue.
   */
  mapState?: {
    pourcentageComplete: number;
    distanceParcourue: number;
    distanceTotaleM: number;
    estTermine: boolean;
    labelDepart: string;
    labelArrivee: string;
    /** Vitesse moyenne km/h — utilisée pour calculer le temps restant */
    vitesseMoyenneKmh: number;
  };
}

export interface UseProgressionReturn {
  fixture: TrajetProgressionFixture;
  secondesEcoulees: number;
  progression: ProgressionCalculee;
  estActif: boolean;
}

// ─────────────────────────────────────────────
// Types pour le système de signalement
// ─────────────────────────────────────────────

export type CibleSignalement = 'conducteur' | 'trajet' | 'plateforme' | 'passager';
export type NiveauSeverite = 'critique' | 'severe' | 'modere' | 'info';
export type NiveauSecurite = 'danger_immediat' | 'incident_recent' | 'malaise' | 'informatif';
export type EtapeSignalement = 1 | 2 | 3 | 4 | 5;

export interface MotifSignalement {
  id: string;
  label: string;
  description: string;
  icone: ReactNode;
  severite: NiveauSeverite;
}

export interface SignalementOptions {
  anonyme: boolean;
  accepterContact: boolean;
  bloquerUtilisateur: boolean;
  notifierResultat: boolean;
}

export interface SignalementData {
  cible: CibleSignalement | null;
  cibleNom: string;
  motifId: string | null;
  motifLabel: string;
  niveauSecurite: NiveauSecurite | null;
  description: string;
  heureIncident: string;
  preuves: string[];
  options: SignalementOptions;
}

export interface SignalementOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  trajetId: string;
  trajetTitre: string;
  cibleNomParDefaut?: string;
  cibleRoleParDefaut?: CibleSignalement;
  /** Rôle de l'utilisateur qui soumet le signalement ('driver' | 'passenger') */
  role?: 'driver' | 'passenger';
}

export interface UseSignalementReturn {
  etapeActuelle: EtapeSignalement;
  signalement: SignalementData;
  estSoumis: boolean;
  referenceSignalement: string;
  peutContinuer: boolean;
  setCible: (c: CibleSignalement) => void;
  setMotif: (id: string, label: string) => void;
  setNiveauSecurite: (n: NiveauSecurite) => void;
  setDescription: (d: string) => void;
  setHeureIncident: (h: string) => void;
  ajouterPreuve: (p: string) => void;
  supprimerPreuve: (i: number) => void;
  setOption: (key: keyof SignalementOptions, value: boolean) => void;
  suivant: () => void;
  precedent: () => void;
  soumettre: () => void;
  reinitialiser: () => void;
  telechargerPDF: () => void;
}
