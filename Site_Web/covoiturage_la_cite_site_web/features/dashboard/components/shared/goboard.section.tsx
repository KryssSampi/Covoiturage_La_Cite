"use client";

import Link from "next/link";
import { useMemo } from "react";
import { FaExternalLinkAlt, FaLink } from "react-icons/fa";

import { Language, useAppState } from "@/core/state/app_state";
import { GoScoreDial } from "@/shared/ui/goscoredial";

import { useGoBoard } from "../../hooks/useGoBoard";
import type { GoTask } from "../../types/goboard.types";
import { FIXTURE_GO_TASKS } from "@/tests/fixtures/dashboard/goboard.fixtures";

export interface GoTaskView {
  task: GoTask;
  isCompleted: boolean;
}

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

export function GoBoard({
  currentScore = 820,
  tasks = FIXTURE_GO_TASKS,
  isLoading = false,
  error = null,
}: {
  currentScore?: number;
  tasks?: GoTask[];
  isLoading?: boolean;
  error?: string | null;
}) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;
  const isDriver = appState.userConnected?.role?.toString().toLowerCase() === "driver";
  const userId = appState.userConnected?.id;
  const role = appState.userConnected?.role?.toString().toLowerCase();

  const taskViews = useMemo<GoTaskView[]>(() => {
    const wantsDriverTasks = role === "driver";

    return tasks
      .filter((task) => {
        if (task.category === "mixte") return true;
        if (task.category === "driverOnly") return wantsDriverTasks;
        if (task.category === "passengerOnly") return !wantsDriverTasks;
        return false;
      })
      .map((task) => ({
        task,
        isCompleted: task.progression?.find((p) => p.userId === userId)?.isDone ?? false,
      }));
  }, [role, tasks, userId]);

  const taskIds = useMemo(
    () => taskViews.map((tv) => tv.task.id),
    [taskViews],
  );
  const { descriptionVisibles, toggleDescription } = useGoBoard(taskIds);

  return (
    <section
      className={`w-full py-16 border rounded-lg shadow-md flex flex-col p-6 ${
        isDriver ? "bg-[#08316e]" : "bg-[#efefef]"
      }`}
    >
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
        <div className="container flex flex-col border-t bg-white items-center justify-center border-black mx-auto">
          <h1 className="text-2xl font-semibold mb-4 text-gray-800">
            <span className="text-blue-300">Go!</span> Score
          </h1>

          <div className="flex items-center -mt-5 justify-between w-full h-fit">
            <div className="flex max-w-3/7 items-center">
              <GoScoreDial currentScore={currentScore} />
            </div>

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
                {[isDriver ? "3xl" : "2xl", "xl", "lg", "[16px]", "sm"].map((size) => (
                  <span key={size} className={`text-${size} text-green-500`}>
                    O
                  </span>
                ))}
                !
              </p>
            </div>
          </div>
        </div>

        <h1
          className={`text-2xl font-semibold -mt-5 -mb-10 ${
            isDriver ? "text-white" : "text-gray-800"
          }`}
        >
          <span className="text-blue-300">Go!</span> Taches
        </h1>

        <div className="flex flex-col border-y-2 border-black w-full items-center bg-transparent justify-center relative">
          <div
            className="flex flex-col bg-white max-w-7/9 overflow-y-auto h-80 min-h-0
                        shadow-[15px_0_15px_-1px_rgba(0,0,0,0.3),-15px_0_15px_-10px_rgba(0,0,0,0.3)]
                        overflow-x-hidden"
            style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          >
            {isLoading ? (
              <GoTasksSkeleton isDriver={!!isDriver} />
            ) : error ? (
              <div className="flex items-center justify-center h-full p-6">
                <p className="text-red-500 text-center">{error}</p>
              </div>
            ) : taskViews.length === 0 ? (
              <div className="flex items-center justify-center h-full p-6">
                <p className="text-gray-500 text-center text-lg">
                  {isFR ? "Aucune tache disponible." : "No tasks available."}
                </p>
              </div>
            ) : (
              taskViews.map((tv) => (
                <button
                  key={tv.task.id}
                  onClick={() => toggleDescription(tv.task.id)}
                  className="flex flex-col items-center w-full px-5 py-3 border hover:bg-gray-100 hover:scale-[1.02] transition-all gap-3"
                >
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
