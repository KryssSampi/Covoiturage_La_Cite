/* AUTO-GENERATED - 2026-02-14 03:38:03 */
/* Table: vehicules */

export class VehiculeModel {
  id: string;
  conducteur_id: string;
  marque: string;
  modele: string;
  couleur?: string | null;
  immatriculation: string;
  annee?: number | null;
  nb_places_max: number;
  photo_url?: string | null;
  actif: boolean;
  valide: boolean;
  created_at: string;
  updated_at: string;

  constructor(data?: Partial<VehiculeModel>) {
    if (data) Object.assign(this, data);
  }
}
