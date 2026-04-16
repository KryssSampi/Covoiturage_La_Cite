"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { GoTask } from "../types/goboard.types";

export interface GoTaskView {
  task: GoTask;
  isCompleted: boolean;
}

interface UseLiveGoTasksResult {
  tasks: GoTaskView[] | null;
  isLoading: boolean;
  error: string | null;
}

export function useLiveGoTasks(
  userId: string | undefined,
  role: string | undefined,
): UseLiveGoTasksResult {
  const [tasks, setTasks] = useState<GoTaskView[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tasksRef = useRef(tasks);
  useEffect(() => { tasksRef.current = tasks; }, [tasks]);

  const handleData = useCallback(
    (rawTasks: GoTask[]) => {
      if (!userId || !role) return;

      const isDriver = role.toLowerCase() === "driver";

      const filtered = rawTasks.filter((t) => {
        if (t.category === "mixte") return true;
        if (t.category === "driverOnly" && isDriver) return true;
        if (t.category === "passengerOnly" && !isDriver) return true;
        return false;
      });

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

    let cancelled = false;

    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/gotasks");
        if (!res.ok) throw new Error("Echec de chargement des GoTasks");
        const data: GoTask[] = await res.json();
        if (cancelled) return;
        handleData(data);
      } catch (err) {
        console.error("[useLiveGoTasks] fetch", err);
        if (!tasksRef.current) {
          setError("Connexion interrompue - GoTasks");
          setIsLoading(false);
        }
      }
    };

    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchTasks();
    const intervalId = setInterval(() => { void fetchTasks(); }, 30_000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [userId, role, handleData]);

  return { tasks, isLoading, error };
}