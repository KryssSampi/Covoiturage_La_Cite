/**
 * @file useGoBoard.ts
 * @description Hook gérant l'état d'affichage des descriptions dans le GoBoard.
 * Extrait de goboard.section.tsx pour séparer logique et présentation.
 *
 * Responsabilités :
 * - Initialiser le tableau de visibilité des descriptions (une entrée par tâche)
 * - Fournir un toggle individuel par index de tâche
 *
 * @param taskCount Nombre de tâches à gérer (longueur de la liste GoTask)
 * @returns {UseGoBoardReturn} État et handler à brancher sur GoBoard
 */

import { useState } from "react";
import { TaskDescriptionVisibility } from "../types/goboard.types";

// ─── Types du hook ───────────────────────────────────────────────────────────

interface UseGoBoardReturn {
  /**
   * Tableau indexé sur GoTask.id - 1.
   * descriptionVisibles[i].isDescriptionVisible === true → description dépliée.
   */
  descriptionVisibles: TaskDescriptionVisibility[];
  /**
   * Bascule la visibilité de la description d'une tâche.
   * @param index Index dans le tableau (GoTask.id - 1)
   */
  toggleDescription: (index: number) => void;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useGoBoard(taskCount: number): UseGoBoardReturn {
  // Initialise toutes les descriptions comme fermées au montage
  const [descriptionVisibles, setDescriptionVisibles] = useState<TaskDescriptionVisibility[]>(
    Array.from({ length: taskCount }, () => ({ isDescriptionVisible: false }))
  );

  /**
   * Bascule la description de la tâche à l'index donné.
   * Utilise un spread pour garantir l'immutabilité et déclencher le re-render.
   */
  const toggleDescription = (index: number) => {
    setDescriptionVisibles((prev) => {
      const next = [...prev];
      next[index] = { isDescriptionVisible: !next[index].isDescriptionVisible };
      return next;
    });
  };

  return { descriptionVisibles, toggleDescription };
}
