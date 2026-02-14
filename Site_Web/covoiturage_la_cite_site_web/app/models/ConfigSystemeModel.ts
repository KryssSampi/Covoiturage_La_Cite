/* AUTO-GENERATED - 2026-02-14 03:37:59 */
/* Table: config_systeme */

export class ConfigSystemeModel {
  id: string;
  cle: string;
  valeur: string;
  type_valeur: string;
  description?: string | null;
  modifie_par?: string | null;
  updated_at: string;

  constructor(data?: Partial<ConfigSystemeModel>) {
    if (data) Object.assign(this, data);
  }
}
