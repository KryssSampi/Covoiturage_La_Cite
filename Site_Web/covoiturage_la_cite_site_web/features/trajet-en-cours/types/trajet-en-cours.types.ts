// ─────────────────────────────────────────────
// Types principaux pour la feature "Trajet en cours"
// ─────────────────────────────────────────────
import type { ReactNode } from 'react';

export type RoleUtilisateur = 'driver' | 'passenger';
export type EtatTrajet = 'confirme' | 'en_cours' | 'termine' | 'annule';
export type ModePaiement = 'comptant' | 'virtuel';
export type NiveauConversation = 'silencieux' | 'modere' | 'bavard';

export interface BadgeConducteur {
  id: string;
  icone: ReactNode;
  label: string;
}

export interface VehiculeInfo {
  marque: string;
  modele: string;
  annee: number;
  couleur: string;
  immatriculation: string;
  nbPlaces: number;
  photo?: string;
}

export interface ConducteurInfo {
  id: string;
  prenom: string;
  nom: string;
  initiales: string;
  photo?: string;
  note: number;
  nbTrajets: number;
  nbTrajetsEnsemble: number;
  badges: BadgeConducteur[];
  vehicule: VehiculeInfo;
  estVerifie: boolean;
  telephone?: string;
}

export interface PassagerInfo {
  id: string;
  prenom: string;
  nom: string;
  initiales: string;
  photo?: string;
  couleurAvatar: string;
  note: number;
  place: number;
  telephone?: string;
}

export interface PointTrajet {
  nom: string;
  adresse: string;
  coordonnees: { lat: number; lng: number };
  instructions?: string;
}

export interface PreferencesTrajet {
  bagagesAutorises: boolean;
  animauxAcceptes: boolean;
  fumeur: boolean;
  musique: boolean;
  niveauConversation: NiveauConversation;
  messagePassagers?: string;
}

export interface StatutTrajet {
  etat: EtatTrajet;
  typeDepart: 'unique' | 'recurrent';
  estRecurrent: boolean;
  detourMaxMin: number;
  modePaiement: ModePaiement;
  nbPlacesDisponibles: number;
  nbPlacesTotales: number;
  derniereMaj: Date;
}

export interface TarifTrajet {
  prixParPassager: number;
  economieVsTaxi: number;
  co2EconomiseKg: number;
}

export interface TrajetEnCoursData {
  id: string;
  titre: string;
  role: RoleUtilisateur;
  conducteur: ConducteurInfo;
  passagers: PassagerInfo[];
  depart: PointTrajet;
  arrivee: PointTrajet;
  preferences: PreferencesTrajet;
  statut: StatutTrajet;
  tarif: TarifTrajet;
  dateDepart?: string;
  heureDepart?: string;
}

export interface EvaluationState {
  /** Note principale obligatoire (conducteur ou passager) */
  note: number;
  /** Commentaire obligatoire (min 10 caractères) */
  commentaire: string;
  /** Note optionnelle du trajet en lui-même */
  noteTrajet?: number;
  /** Note optionnelle de la réservation */
  noteReservation?: number;
  /** ID du passager sélectionné (conducteur uniquement) */
  passagerSelectionne?: string;
  estSoumis: boolean;
}
