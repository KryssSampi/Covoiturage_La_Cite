"use client";

/**
 * @file goboard.section.tsx
 * @description Section GoBoard du dashboard — commune à tous les rôles.
 *
 * Affiche deux éléments de gamification :
 * 1. GoScore — jauge circulaire + score numérique avec label dynamique
 * 2. GoTâches — liste de défis cliquables avec description accordéon + lien d'action
 *
 * Le fond et certaines tailles varient selon le rôle (conducteur = dark, passager = clair).
 *
 * @uses useGoBoard — gestion de l'accordéon des descriptions
 * @uses GoTask — type depuis dashboard/types
 * @uses FIXTURE_GO_TASKS — données de test (à remplacer par API)
 */

import Link from "next/link";
import { FaExternalLinkAlt, FaLink } from "react-icons/fa";

import { Language, useAppState } from "@/core/state/app_state";
import { GoScoreDial } from "@/shared/ui/goscoredial";

import { useGoBoard } from "../../hooks/useGoBoard";
import { GoTask } from "../../types/goboard.types";
import { FIXTURE_GO_TASKS } from "@/tests/fixtures/dashboard/goboard.fixtures";

// ─── Composant principal ─────────────────────────────────────────────────────

/**
 * GoBoard
 *
 * @param tasks Liste des tâches de gamification.
 *   Par défaut : données de test (FIXTURE_GO_TASKS).
 *   TODO: Brancher sur GET /api/users/{userId}/go-tasks
 * @param currentScore GoScore actuel de l'utilisateur.
 *   TODO: Brancher sur GET /api/users/{userId}/go-score
 */
export function GoBoard({
  tasks = FIXTURE_GO_TASKS,
  currentScore = 820,
}: {
  tasks?: GoTask[];
  currentScore?: number;
}) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;
  const isDriver = appState.userConnected?.role?.toString() === "driver";

  const { descriptionVisibles, toggleDescription } = useGoBoard(tasks.length);

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

              {/*
               * Effet visuel "zoom-out" : lettres O de taille décroissante
               * pour simuler un écho graphique du mot "Go" (identité visuelle).
               */}
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
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => toggleDescription(task.id - 1)}
                className="flex flex-col items-center w-full px-5 py-3 border hover:bg-gray-100 hover:scale-[1.02] transition-all gap-3"
              >
                {/* Ligne principale : checkbox + titre + points */}
                <div className="flex items-center w-full">
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    readOnly
                    className={`mr-3 w-5 h-5 ${
                      task.isCompleted ? "accent-green-700" : "accent-gray-400"
                    }`}
                  />
                  <span
                    className="flex-1 text-black font-semibold truncate"
                    title={isFR ? task.titlefr : task.titleen}
                  >
                    {isFR ? task.titlefr : task.titleen}
                  </span>
                  <span className="flex-none font-bold text-green-500 whitespace-nowrap">
                    +{task.points}
                  </span>
                </div>

                {/* Description accordéon : animation grid-rows pour transition fluide */}
                <div
                  className={`grid transition-all duration-500 ease-in-out bg-gray-300 overflow-hidden ${
                    descriptionVisibles[task.id - 1]?.isDescriptionVisible
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0 -mt-2"
                  }`}
                >
                  {/* Wrapper interne crucial pour que grid-rows calcule correctement la hauteur */}
                  <div className="min-h-0">
                    <p
                      className={`text-gray-600 border-t text-center text-sm p-4 transition-all duration-500 ${
                        descriptionVisibles[task.id - 1]?.isDescriptionVisible
                          ? "translate-y-0 scale-100"
                          : "-translate-y-2 scale-95"
                      }`}
                      onMouseLeave={() => toggleDescription(task.id - 1)}
                    >
                      {isFR ? task.descriptionfr : task.descriptionen}
                      <Link
                        href={task.link}
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
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
