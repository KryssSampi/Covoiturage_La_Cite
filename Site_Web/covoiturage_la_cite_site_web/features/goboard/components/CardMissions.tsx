"use client";

/**
 * CardMissions — liste des missions avec barre de progression et points récompense.
 */

import React from "react";
import { FaBullseye, FaCircleCheck } from "react-icons/fa6";
import Card from "./ui/Card";
import CardHeader from "./ui/CardHeader";
import TrendMsg from "./ui/TrendMsg";
import type { Mission } from "../types/goboard.types";

function CardMissions({ missions }: { missions: Mission[] }) {
  const completed = missions.filter((m) => m.estCompletee).length;
  return (
    <Card delay={150}>
      <CardHeader
        dotColor="#08316e"
        title={<><span className="text-[#08316e]">Go!</span>&nbsp;Tâches</>}
        right={<span className="text-[11px] text-[#7a90b8]">{completed} / {missions.length} complétées</span>}
      />
      <div className="px-5 py-3 flex flex-col gap-2">
        {missions.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-3 p-3 bg-[#f0f4fb] rounded-xl border border-[rgba(8,49,110,0.09)] transition-opacity"
            style={{ opacity: m.estCompletee ? 0.55 : 1 }}
          >
            {/* Case à cocher */}
            <div
              className="w-5.5 h-5.5 rounded-md shrink-0 flex items-center justify-center text-[11px]"
              style={{
                border: m.estCompletee ? "none" : "1.5px solid rgba(8,49,110,0.18)",
                background: m.estCompletee ? "#0aad6a" : "transparent",
                color: m.estCompletee ? "#fff" : "transparent",
              }}
            >
              {m.estCompletee && <FaCircleCheck size={11} />}
            </div>
            {/* Contenu */}
            <div className="flex-1">
              <div className="font-semibold text-xs">{m.titre}</div>
              <div className="text-[#7a90b8] text-[10px] mt-0.5">{m.description}</div>
              {!m.estCompletee && m.objectif > 0 && m.progres > 0 && (
                <div className="mt-1">
                  <div className="h-1 bg-[rgba(8,49,110,0.08)] rounded-sm overflow-hidden">
                    <div
                      className="h-full rounded-sm transition-[width] duration-1000 ease-out"
                      style={{ width: `${(m.progres / m.objectif) * 100}%`, background: "linear-gradient(90deg,#08316e,#1a5cb0)" }}
                    />
                  </div>
                  <div className="text-[9px] text-[#7a90b8] mt-0.5">{m.progres} / {m.objectif}</div>
                </div>
              )}
            </div>
            {/* Points récompense */}
            <div
              className="font-[Syne] font-extrabold text-sm shrink-0"
              style={{ color: m.estCompletee ? "#0aad6a" : "#c8960a" }}
            >
              +{m.pointsRecompense}{m.estCompletee ? " ✓" : ""}
            </div>
          </div>
        ))}
      </div>
      <TrendMsg variant="warn" icon={<FaBullseye className="text-[#c8960a]" />}>
        <strong>Vous avez 130 points potentiels à portée de main cette semaine.</strong>{" "}
        Les tâches &quot;3 trajets&quot; et &quot;Laisser un avis&quot; sont les plus faciles à débloquer rapidement.
      </TrendMsg>
    </Card>
  );
}

export default CardMissions;
