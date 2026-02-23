/* AUTO-GENERATED - 2026-02-15 02:48:22 */
/* Table: vehicules */

export class VehiculeModel {
  id: string = '';
  conducteur_id: string = '';
  marque: string = '';
  modele: string = '';
  couleur?: string | null = null;
  immatriculation: string = '';
  annee?: number | null = null;
  nb_places_max: number = 0;
  photo_url?: string | null = null;
  actif: boolean = false;
  valide: boolean = false;
  created_at: string = '';
  updated_at: string = '';

  constructor(data?: Partial<VehiculeModel>) {
    if (data) Object.assign(this, data);
  }
}
