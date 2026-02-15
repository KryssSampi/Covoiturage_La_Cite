/* AUTO-GENERATED - 2026-02-15 02:48:18 */
/* Table: consentements_pipeda */

export class ConsentementsPipedaModel {
  id: string = '';
  user_id: string = '';
  consentement_partage_donnees: boolean = false;
  consentement_geolocalisation: boolean = false;
  consentement_marketing: boolean = false;
  consentement_analyse_comportement: boolean = false;
  version_politique: string = '';
  date_consentement: string = '';
  ip_consentement?: string | null;
  updated_at: string = '';

  constructor(data?: Partial<ConsentementsPipedaModel>) {
    if (data) Object.assign(this, data);
  }
}
