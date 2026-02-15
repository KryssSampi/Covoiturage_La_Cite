/* AUTO-GENERATED - 2026-02-15 02:48:18 */
/* Table: categories_signalement */

export class CategoriesSignalementModel {
  id: string = '';
  code: string = '';
  nom: string = '';
  description?: string | null;
  gravite_defaut: string = '';
  penalite_suggeree?: number | null;

  constructor(data?: Partial<CategoriesSignalementModel>) {
    if (data) Object.assign(this, data);
  }
}
