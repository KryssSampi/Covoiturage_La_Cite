/**
 * @file goboard.types.ts
 * @description Types et interfaces pour le système GoBoard (tâches + GoScore) du dashboard.
 * Les GoTasks sont stockées en base de données (gotasks.json) et servies via SSE.
 */

// ─── Catégorie de tâche ──────────────────────────────────────────────────────

/** Catégorie déterminant quels rôles voient la tâche */
export type GoTaskCategory = 'mixte' | 'passengerOnly' | 'driverOnly';

// ─── Progression utilisateur ─────────────────────────────────────────────────

/** Progression d'un utilisateur sur une tâche donnée */
export interface GoTaskProgression {
  /** ID de l'utilisateur */
  userId: string;
  /** Vrai si la tâche est complétée par cet utilisateur */
  isDone: boolean;
}

// ─── Interface principale ────────────────────────────────────────────────────

/**
 * Tâche de gamification GoBoard stockée en base.
 * La catégorie filtre la visibilité selon le rôle de l'utilisateur.
 * La progression est gérée côté serveur (admin uniquement).
 */
export interface GoTask {
  /** Identifiant unique, ex: "GT-001" */
  id: string;
  /** Titre affiché en français */
  titlefr: string;
  /** Titre affiché en anglais */
  titleen: string;
  /** Description détaillée en français */
  descriptionfr: string;
  /** Description détaillée en anglais */
  descriptionen: string;
  /** Catégorie : mixte | passengerOnly | driverOnly */
  category: GoTaskCategory;
  /** Route Next.js vers laquelle le lien d'action pointe */
  link: string;
  /** Points GoScore gagnés à la complétion */
  points: number;
  /** Liste des progressions par utilisateur */
  progression: GoTaskProgression[];
}

// ─── Interface état UI ───────────────────────────────────────────────────────

/**
 * État de visibilité de la description pour chaque tâche.
 * Maintenu dans useGoBoard sous forme de Map indexée sur GoTask.id.
 */
export interface TaskDescriptionVisibility {
  isDescriptionVisible: boolean;
}
