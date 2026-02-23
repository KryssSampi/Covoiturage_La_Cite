/**
 * @file goboard.types.ts
 * @description Types et interfaces pour le système GoBoard (tâches + GoScore) du dashboard.
 * Utilisé par GoBoard et useGoBoard.
 */

// ─── Interface principale ────────────────────────────────────────────────────

/**
 * Représente une tâche de gamification dans le GoBoard.
 * Chaque tâche est bilingue (FR/EN) et associée à un lien d'action et un gain de points.
 */
export interface GoTask {
  /** Identifiant unique de la tâche (commence à 1, utilisé comme index de tableau - 1) */
  id: number;
  /** Titre affiché en français */
  titlefr: string;
  /** Titre affiché en anglais */
  titleen: string;
  /** Description détaillée en français, visible au clic */
  descriptionfr: string;
  /** Description détaillée en anglais, visible au clic */
  descriptionen: string;
  /** true = tâche accomplie (case cochée en vert) */
  isCompleted: boolean;
  /** Route Next.js vers laquelle le lien dans la description pointe */
  link: string;
  /** Nombre de points GoScore gagnés à la complétion de la tâche */
  points: number;
}

// ─── Interface état UI ───────────────────────────────────────────────────────

/**
 * État de visibilité de la description pour chaque tâche.
 * Maintenu dans useGoBoard sous forme de tableau indexé sur GoTask.id - 1.
 */
export interface TaskDescriptionVisibility {
  isDescriptionVisible: boolean;
}
