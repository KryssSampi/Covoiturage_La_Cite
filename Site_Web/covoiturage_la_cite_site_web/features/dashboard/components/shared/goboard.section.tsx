"use client";

/**
 * @file goboard.section.tsx
 * @description Section GoBoard du dashboard — commune à tous les rôles.
 *
 * Composant autonome : se connecte au flux SSE des GoTasks et se met à jour
 * en temps réel. Les tâches sont filtrées par le rôle de l'utilisateur :
 *   - mixte → tout le monde
 *   - driverOnly → conducteurs uniquement
 *   - passengerOnly → passagers uniquement
 *
 * Les cases ne sont pas cochables par l'utilisateur : seul un admin peut
 * modifier la progression côté serveur. La case est cochée si dans la
 * progression de cet utilisateur, isDone est true.
 *
 * Affiche deux éléments de gamification :
 * 1. GoScore — jauge circulaire + score numérique avec label dynamique
 * 2. GoTâches — liste SSE avec description accordéon + lien d'action
 *
 * @uses useLiveGoTasks — hook SSE GoTasks (temps réel + filtrage rôle)
 * @uses useGoBoard — gestion de l'accordéon des descriptions
 */

import Link from "next/link";
import { useMemo } from "react";
import { FaExternalLinkAlt, FaLink } from "react-icons/fa";

import { Language, useAppState } from "@/core/state/app_state";
import { GoScoreDial } from "@/shared/ui/goscoredial";

import { useGoBoard } from "../../hooks/useGoBoard";
import { useLiveGoTasks, GoTaskView } from "../../hooks/useLiveGoTasks";

// ─── Squelette de chargement ─────────────────────────────────────────────────

/** Placeholder animé affiché pendant le chargement SSE */
function GoTasksSkeleton({ isDriver }: { isDriver: boolean }) {
  return (
    <div className="flex flex-col w-full gap-2 py-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`w-full h-12 rounded-lg animate-pulse ${
            isDriver ? "bg-white/20" : "bg-gray-300/50"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Composant principal ─────────────────────────────────────────────────────

/**
 * GoBoard
 *
 * Composant autonome — se connecte au flux SSE des GoTasks.
 * Les tâches sont filtrées par rôle et la progression de l'utilisateur courant.
 *
 * @param currentScore GoScore actuel de l'utilisateur.
 */
export function GoBoard({
  currentScore = 820,
}: {
  currentScore?: number;
}) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;
  const isDriver = appState.userConnected?.role?.toString().toLowerCase() === "driver";
  const userId = appState.userConnected?.id;
  const role = appState.userConnected?.role?.toString().toLowerCase();

  // Flux SSE temps réel — filtré par rôle + progression utilisateur
  const { tasks, isLoading, error } = useLiveGoTasks(userId, role);

  // IDs des tâches pour le hook d'accordéon
  const taskIds = useMemo(
    () => (tasks ?? []).map((tv) => tv.task.id),
    [tasks],
  );
  const { descriptionVisibles, toggleDescription } = useGoBoard(taskIds);

  return (
    <section
      className={`w-full py-16 border rounded-lg shadow-md flex flex-col p-6 ${
        isDriver ? "bg-[#08316e]" : "bg-[#efefef]"
      }`}
    >
      {/* ─── En-tête ───────────────────────────────────────────────────── */}
      <div className="container mx-auto flex items-center justify-between">
        <h2
          className={`text-4xl font-bold -mt-10 mb-1 ${
            isDriver ? "text-white" : "text-black"
          }`}
        >
          <span className="text-blue-300">Go!</span> Board
        </h2>
        <FaExternalLinkAlt
          className={`text-2xl -mt-10 mb-1 ${
            isDriver ? "text-white" : "text-gray-400"
          }`}
        />
      </div>

      <div className="container mx-auto flex flex-col items-center justify-between gap-y-10">
        {/* ─── Section GoScore ─────────────────────────────────────────── */}
        <div className="container flex flex-col border-t bg-white items-center justify-center border-black mx-auto">
          <h1 className="text-2xl font-semibold mb-4 text-gray-800">
            <span className="text-blue-300">Go!</span> Score
          </h1>

          <div className="flex items-center -mt-5 justify-between w-full h-fit">
            {/* Jauge circulaire */}
            <div className="flex max-w-3/7 items-center">
              <GoScoreDial currentScore={currentScore} />
            </div>

            {/* Score numérique + label */}
            <div className="flex flex-col items-center text-center">
              <span
                className={`${
                  isDriver ? "text-6xl" : "text-2xl"
                } font-bold text-[#08316e]`}
              >
                {currentScore}
              </span>

              <p
                className={`text-green-500 ${
                  isDriver ? "text-4xl" : "text-2xl"
                }`}
              >
                Hyper G
                {[
                  isDriver ? "3xl" : "2xl",
                  "xl",
                  "lg",
                  "[16px]",
                  "sm",
                ].map((size) => (
                  <span key={size} className={`text-${size} text-green-500`}>
                    O
                  </span>
                ))}
                !
              </p>
            </div>
          </div>
        </div>

        {/* ─── Section GoTâches ─────────────────────────────────────────── */}
        <h1
          className={`text-2xl font-semibold -mt-5 -mb-10 ${
            isDriver ? "text-white" : "text-gray-800"
          }`}
        >
          <span className="text-blue-300">Go!</span> Tâches
        </h1>

        <div className="flex flex-col border-y-2 border-black w-full items-center bg-transparent justify-center relative">
          <div
            className="flex flex-col bg-white max-w-7/9 overflow-y-auto h-80 min-h-0
                        shadow-[15px_0_15px_-1px_rgba(0,0,0,0.3),-15px_0_15px_-10px_rgba(0,0,0,0.3)]
                        overflow-x-hidden"
            style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          >
            {/* Chargement SSE */}
            {isLoading ? (
              <GoTasksSkeleton isDriver={!!isDriver} />
            ) : error ? (
              <div className="flex items-center justify-center h-full p-6">
                <p className="text-red-500 text-center">{error}</p>
              </div>
            ) : !tasks || tasks.length === 0 ? (
              <div className="flex items-center justify-center h-full p-6">
                <p className="text-gray-500 text-center text-lg">
                  {isFR ? "Aucune tâche disponible." : "No tasks available."}
                </p>
              </div>
            ) : (
              tasks.map((tv: GoTaskView) => (
                <button
                  key={tv.task.id}
                  onClick={() => toggleDescription(tv.task.id)}
                  className="flex flex-col items-center w-full px-5 py-3 border hover:bg-gray-100 hover:scale-[1.02] transition-all gap-3"
                >
                  {/* Ligne principale : checkbox + titre + points */}
                  <div className="flex items-center w-full">
                    <input
                      type="checkbox"
                      checked={tv.isCompleted}
                      readOnly
                      className={`mr-3 w-5 h-5 pointer-events-none ${
                        tv.isCompleted ? "accent-green-700" : "accent-gray-400"
                      }`}
                    />
                    <span
                      className={`flex-1 font-semibold truncate ${
                        tv.isCompleted ? "text-green-700 line-through" : "text-black"
                      }`}
                      title={isFR ? tv.task.titlefr : tv.task.titleen}
                    >
                      {isFR ? tv.task.titlefr : tv.task.titleen}
                    </span>
                    <span className="flex-none font-bold text-green-500 whitespace-nowrap">
                      +{tv.task.points}
                    </span>
                  </div>

                  {/* Description accordéon */}
                  <div
                    className={`grid transition-all duration-500 ease-in-out bg-gray-300 overflow-hidden ${
                      descriptionVisibles[tv.task.id]
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0 -mt-2"
                    }`}
                  >
                    <div className="min-h-0">
                      <p
                        className={`text-gray-600 border-t text-center text-sm p-4 transition-all duration-500 ${
                          descriptionVisibles[tv.task.id]
                            ? "translate-y-0 scale-100"
                            : "-translate-y-2 scale-95"
                        }`}
                        onMouseLeave={() => toggleDescription(tv.task.id)}
                      >
                        {isFR ? tv.task.descriptionfr : tv.task.descriptionen}
                        <Link
                          href={tv.task.link}
                          className="text-blue-500 underline text-center w-full block mt-2"
                        >
                          <span className="flex items-center justify-center gap-1">
                            {isFR ? "Cliquez ici" : "Click here"}
                            <FaLink />
                          </span>
                        </Link>
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
