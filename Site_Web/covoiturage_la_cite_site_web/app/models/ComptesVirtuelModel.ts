/* AUTO-GENERATED - 2026-02-14 03:37:59 */
/* Table: comptes_virtuels */

export class ComptesVirtuelModel {
  id: string;
  user_id: string;
  balance_disponible: number;
  balance_pending: number;
  balance_penalite: number;
  taux_prelevement_actuel: number;
  iban?: string | null;
  nom_banque?: string | null;
  updated_at: string;

  constructor(data?: Partial<ComptesVirtuelModel>) {
    if (data) Object.assign(this, data);
  }
}
