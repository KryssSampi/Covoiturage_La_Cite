"use client";

/**
 * @file useLiveGoTasks.ts
 * @description Hook SSE pour les GoTasks en temps réel.
 *
 * Fonctionnement :
 * 1. Ouvre une connexion SSE vers /api/sse/db-watch/gotasks
 * 2. Reçoit le contenu initial + chaque modification du fichier JSON
 * 3. Filtre les tâches selon le rôle de l'utilisateur :
 *    - mixte → visible pour tous
 *    - driverOnly → visible uniquement pour les conducteurs
 *    - passengerOnly → visible uniquement pour les passagers
 * 4. Résout `isCompleted` depuis la progression de l'utilisateur courant
 *
 * @returns { tasks, isLoading, error }
 */

import { useEffect, useRef, useState, useCallback } from "react";
import type { GoTask } from "../types/goboard.types";

/** Vue d'une tâche filtrée pour l'utilisateur courant */
export interface GoTaskView {
  /** Tâche brute depuis la base */
  task: GoTask;
  /** Vrai si l'utilisateur courant a isDone = true dans la progression */
  isCompleted: boolean;
}

interface UseLiveGoTasksResult {
  /** Tâches filtrées pour le rôle + progression de l'utilisateur — null avant le premier SSE */
  tasks: GoTaskView[] | null;
  /** Vrai uniquement avant le premier message du serveur */
  isLoading: boolean;
  /** Message d'erreur si la connexion SSE a échoué */
  error: string | null;
}

/**
 * Hook SSE temps réel pour les GoTasks.
 *
 * @param userId ID de l'utilisateur connecté
 * @param role Rôle de l'utilisateur ("driver" | "passenger")
 */
export function useLiveGoTasks(
  userId: string | undefined,
  role: string | undefined,
): UseLiveGoTasksResult {
  const [tasks, setTasks] = useState<GoTaskView[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const esRef = useRef<EventSource | null>(null);
  const tasksRef = useRef(tasks);
  useEffect(() => { tasksRef.current = tasks; }, [tasks]);

  /**
   * Filtre les tâches par rôle et résout la progression de l'utilisateur.
   */
  const handleData = useCallback(
    (rawTasks: GoTask[]) => {
      if (!userId || !role) return;

      const isDriver = role.toLowerCase() === "driver";

      // Filtrage par catégorie selon le rôle
      const filtered = rawTasks.filter((t) => {
        if (t.category === "mixte") return true;
        if (t.category === "driverOnly" && isDriver) return true;
        if (t.category === "passengerOnly" && !isDriver) return true;
        return false;
      });

      // Résolution de la progression pour l'utilisateur courant
      const views: GoTaskView[] = filtered.map((task) => {
        const userProg = task.progression?.find((p) => p.userId === userId);
        return {
          task,
          isCompleted: userProg?.isDone ?? false,
        };
      });

      setTasks(views);
      setIsLoading(false);
      setError(null);
    },
    [userId, role],
  );

  useEffect(() => {
    if (!userId || !role) return;

    // Ouverture de la connexion SSE
    const es = new EventSource("/api/sse/db-watch/gotasks");
    esRef.current = es;

    es.addEventListener("update", (event) => {
      try {
        const data: GoTask[] = JSON.parse(event.data);
        handleData(data);
      } catch {
        console.error("[useLiveGoTasks] Erreur parsing SSE");
      }
    });

    es.addEventListener("error", () => {
      if (!tasksRef.current) {
        setError("Connexion SSE interrompue — GoTasks");
        setIsLoading(false);
      }
    });

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [userId, role, handleData]);

  return { tasks, isLoading, error };
}
