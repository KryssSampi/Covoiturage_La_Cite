export interface IndisponibilityDateRange {
  id: string;
  startAt: string;
  endAt: string;
  weekday?: string;
  start?: string;
  end?: string;
}

export interface IndisponibilityModel {
  /**
   * Identifiant du document, aligne sur l'id utilisateur demande.
   * Exemple: "USR-2026-00001"
   */
  id: string;
  dates: IndisponibilityDateRange[];
  createdAt: string;
  updatedAt: string;
}
