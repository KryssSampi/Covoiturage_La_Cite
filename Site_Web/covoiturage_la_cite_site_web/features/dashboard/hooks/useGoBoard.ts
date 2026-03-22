/**
 * @file useGoBoard.ts
 * @description Hook gérant l'état d'affichage des descriptions dans le GoBoard.
 *
 * Responsabilités :
 * - Maintenir un Map<string, boolean> de visibilité des descriptions
 * - Fournir un toggle individuel par ID de tâche
 *
 * @param taskIds Liste des IDs de tâches à gérer
 * @returns {UseGoBoardReturn} État et handler à brancher sur GoBoard
 */

import { useState, useCallback, useEffect } from "react";

// ─── Types du hook ───────────────────────────────────────────────────────────

interface UseGoBoardReturn {
  /** Map indexée sur GoTask.id → true si description dépliée */
  descriptionVisibles: Record<string, boolean>;
  /** Bascule la visibilité de la description d'une tâche */
  toggleDescription: (taskId: string) => void;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useGoBoard(taskIds: string[]): UseGoBoardReturn {
  // Initialise toutes les descriptions comme fermées
  const [descriptionVisibles, setDescriptionVisibles] = useState<Record<string, boolean>>({});

  // Réinitialise quand la liste de tâches change
  useEffect(() => {
    const init: Record<string, boolean> = {};
    for (const id of taskIds) {
      init[id] = false;
    }
    setDescriptionVisibles(init);
  }, [taskIds.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleDescription = useCallback((taskId: string) => {
    setDescriptionVisibles((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  }, []);

  return { descriptionVisibles, toggleDescription };
}
