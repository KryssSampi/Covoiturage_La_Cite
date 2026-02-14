/* AUTO-GENERATED - 2026-02-14 03:37:59 */
/* Table: consentements_pipeda */

export class ConsentementsPipedaModel {
  id: string;
  user_id: string;
  consentement_partage_donnees: boolean;
  consentement_geolocalisation: boolean;
  consentement_marketing: boolean;
  consentement_analyse_comportement: boolean;
  version_politique: string;
  date_consentement: string;
  ip_consentement?: string | null;
  updated_at: string;

  constructor(data?: Partial<ConsentementsPipedaModel>) {
    if (data) Object.assign(this, data);
  }
}
