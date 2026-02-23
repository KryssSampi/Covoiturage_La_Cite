/* AUTO-GENERATED - 2026-02-15 02:48:18 */
/* Table: comptes_virtuels */

export class ComptesVirtuelModel {
  id: string = '';
  user_id: string = '';
  balance_disponible: number = 0;
  balance_pending: number = 0;
  balance_penalite: number = 0;
  taux_prelevement_actuel: number = 0;
  iban?: string | null;
  nom_banque?: string | null;
  updated_at: string = '';

  constructor(data?: Partial<ComptesVirtuelModel>) {
    if (data) Object.assign(this, data);
  }
}
