/**
 * @file lacite_astuces.types.ts
 * @description Types pour le carrousel d'astuces La Cité du dashboard.
 * Utilisé par LaCiteAstucesSection.
 */

// ─── Interface principale ────────────────────────────────────────────────────

/**
 * Représente une astuce affichée dans le carrousel LaCiteAstucesSection.
 * Chaque astuce est bilingue avec une image illustrative.
 */
export interface Tip {
  /** Identifiant unique de l'astuce */
  id: number;
  /** Chemin vers l'image dans /public */
  src: string;
  /** Titre affiché en français */
  titlefr: string;
  /** Titre affiché en anglais */
  titleen: string;
  /** Description complète en français */
  descriptionfr: string;
  /** Description complète en anglais */
  descriptionen: string;
}
