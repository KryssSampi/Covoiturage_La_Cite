"use client";

/**
 * CardMissions — liste des Go!Tâches avec case à cocher et points récompense.
 * Plus de barre de progression — affichage simple fait/pas fait.
 */

import React from "react";
import { FaBullseye, FaCircleCheck } from "react-icons/fa6";
import Card from "./ui/Card";
import CardHeader from "./ui/CardHeader";
import TrendMsg from "./ui/TrendMsg";
import type { GoTask } from "../types/goboard.types";

function CardMissions({ goTasks, userId }: { goTasks: GoTask[]; userId: string }) {
  // Filtrer les tâches pertinentes et calculer la complétion pour l'utilisateur
  // Server Core résout déjà la progression par utilisateur → isCompleted direct
  const tasksWithStatus = goTasks.map((task) => ({
    ...task,
    isDone: task.isCompleted,
  }));
  const completed = tasksWithStatus.filter((t) => t.isDone).length;
  const potentialPoints = tasksWithStatus
    .filter((t) => !t.isDone)
    .reduce((sum, t) => sum + t.points, 0);

  return (
    <Card delay={150}>
      <CardHeader
        dotColor="#08316e"
        title={<><span className="text-[#08316e]">Go!</span>&nbsp;Tâches</>}
        right={<span className="text-[11px] text-[#7a90b8]">{completed} / {tasksWithStatus.length} complétées</span>}
      />
      <div className="px-5 py-3 flex flex-col gap-2 max-h-[40vh] overflow-y-auto">
        {tasksWithStatus.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 p-3 bg-[#f0f4fb] rounded-xl border border-[rgba(8,49,110,0.09)] transition-opacity"
            style={{ opacity: t.isDone ? 0.55 : 1 }}
          >
            {/* Case à cocher */}
            <div
              className="w-5.5 h-5.5 rounded-md shrink-0 flex items-center justify-center text-[11px]"
              style={{
                border: t.isDone ? "none" : "1.5px solid rgba(8,49,110,0.18)",
                background: t.isDone ? "#0aad6a" : "transparent",
                color: t.isDone ? "#fff" : "transparent",
              }}
            >
              {t.isDone && <FaCircleCheck size={11} />}
            </div>
            {/* Contenu */}
            <div className="flex-1">
              <div className="font-semibold text-xs text-[#0d1f3c]">{t.titleFr}</div>
              <div className="text-[#7a90b8] text-[10px] mt-0.5">{t.descriptionFr}</div>
            </div>
            {/* Points récompense */}
            <div
              className="font-[Syne] font-extrabold text-sm shrink-0"
              style={{ color: t.isDone ? "#0aad6a" : "#c8960a" }}
            >
              +{t.points}{t.isDone ? " ✓" : ""}
            </div>
          </div>
        ))}
      </div>
      {potentialPoints > 0 && (
        <TrendMsg variant="warn" icon={<FaBullseye className="text-[#c8960a]" />}>
          <strong>Vous avez {potentialPoints} points potentiels à portée de main.</strong>{" "}
          Complétez vos tâches restantes pour grimper dans le classement.
        </TrendMsg>
      )}
    </Card>
  );
}

export default CardMissions;
