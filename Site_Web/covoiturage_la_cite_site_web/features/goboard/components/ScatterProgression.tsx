"use client";

/**
 * ScatterProgression — graphique scatter de la progression du GoScore sur 30 jours.
 */

import React from "react";
import { FaRocket } from "react-icons/fa6";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import TrendMsg from "./ui/TrendMsg";

// ─── Composant ──────────────────────────────────────────────────────────────

function ScatterProgression({ scale }: { scale: number }) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.15 });

  return (
    <div>
      {/* Conteneur hauteur fixe — la carte ne grandit pas au zoom */}
      <div className="w-full overflow-hidden" style={{ aspectRatio: "530/200" }}>
      <div
        className="zoom-wrap overflow-auto h-full"
        style={{ cursor: scale > 1 ? "zoom-out" : "zoom-in" }}
      >
        <div
          ref={ref}
          className="p-3 px-5"
          style={{ transform: `scale(${scale})`, transformOrigin: "top left", transition: "transform 0.3s", width: `${100 / scale}%` }}
        >
          <svg viewBox="0 0 530 200" xmlns="http://www.w3.org/2000/svg" className="w-full block">
            <defs>
              <linearGradient id="areaG-go" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#0aad6a" stopOpacity=".25" />
                <stop offset="100%" stopColor="#08316e" stopOpacity=".03" />
              </linearGradient>
            </defs>
            {/* Axes */}
            <line x1="48" y1="10" x2="48" y2="180" stroke="#c8d4ec" strokeWidth="1" />
            <line x1="48" y1="180" x2="508" y2="180" stroke="#c8d4ec" strokeWidth="1" />
            {/* Grille horizontale */}
            {[148, 112, 79, 47, 20].map((y) => (
              <line key={y} x1="48" y1={y} x2="508" y2={y} stroke="#e8edf8" strokeWidth="1" strokeDasharray="3,4" />
            ))}
            {/* Labels Y */}
            {([["580", 178], ["640", 146], ["700", 114], ["760", 82], ["810", 50], ["850", 23]] as const).map(([l, y]) => (
              <text key={l} x="42" y={y} textAnchor="end" fontSize="8" fill="#7a90b8">{l}</text>
            ))}
            {/* Labels X */}
            {([["12 fév", 75], ["20 fév", 130], ["28 fév", 185], ["5 mars", 240], ["9 mars", 295], ["11 mars", 360], ["12 mars", 430], ["13 mars", 490]] as const).map(([l, x]) => (
              <text key={l} x={x} y="190" textAnchor="middle" fontSize="8" fill="#7a90b8">{l as string}</text>
            ))}
            {/* Aire dégradée */}
            <polygon points="75,155 100,150 130,132 165,126 195,136 220,117 230,143 260,104 295,90 330,72 360,65 390,69 420,57 455,45 490,50" fill="url(#areaG-go)" />
            {/* Polyline tendance pointillée */}
            <polyline
              points="75,155 100,150 130,132 165,126 195,136 220,117 230,143 260,104 295,90 330,72 360,65 390,69 420,57 455,45 490,50"
              fill="none" stroke="rgba(8,49,110,0.2)" strokeWidth="1.5" strokeDasharray="4,3"
            />
            {/* Points gains (vert) */}
            {([[75, 155, 5], [100, 150, 6], [130, 132, 7], [165, 126, 5]] as const).map(([cx, cy, r], i) => (
              <circle key={i} cx={cx} cy={cy} r={r} fill="#0aad6a" opacity=".85"
                style={{ animation: isVisible ? `scatterPop 0.4s ease ${i * 60 + 100}ms both` : "none" }} />
            ))}
            {/* Pertes (rouge) */}
            <circle cx="195" cy="136" r="6" fill="#e03050" opacity=".85" style={{ animation: isVisible ? "scatterPop 0.4s ease 340ms both" : "none" }} />
            <text x="202" y="132" fontSize="8" fill="#e03050">−10</text>
            <circle cx="220" cy="117" r="6" fill="#0aad6a" opacity=".88" style={{ animation: isVisible ? "scatterPop 0.4s ease 380ms both" : "none" }} />
            <circle cx="230" cy="143" r="6" fill="#e03050" opacity=".8" style={{ animation: isVisible ? "scatterPop 0.4s ease 420ms both" : "none" }} />
            <text x="237" y="139" fontSize="8" fill="#e03050">−15</text>
            {/* Badge (or) */}
            <circle cx="260" cy="104" r="7" fill="#c8960a" opacity=".9" style={{ animation: isVisible ? "scatterPop 0.4s ease 460ms both" : "none" }} />
            <text x="267" y="100" fontSize="8" fill="#c8960a">+20</text>
            {/* Gains suite */}
            {([[295, 90, 6], [330, 72, 8]] as const).map(([cx, cy, r], i) => (
              <circle key={i} cx={cx} cy={cy} r={r} fill="#0aad6a" opacity=".88"
                style={{ animation: isVisible ? `scatterPop 0.4s ease ${500 + i * 40}ms both` : "none" }} />
            ))}
            {/* Badge */}
            <circle cx="360" cy="65" r="7" fill="#c8960a" opacity=".9" style={{ animation: isVisible ? "scatterPop 0.4s ease 580ms both" : "none" }} />
            <text x="367" y="61" fontSize="8" fill="#c8960a">+15</text>
            {([[390, 69, 6], [420, 57, 7]] as const).map(([cx, cy, r], i) => (
              <circle key={i} cx={cx} cy={cy} r={r} fill="#0aad6a" opacity=".85"
                style={{ animation: isVisible ? `scatterPop 0.4s ease ${620 + i * 40}ms both` : "none" }} />
            ))}
            {/* Score actuel */}
            <circle cx="455" cy="45" r="9" fill="#08316e" opacity=".95" style={{ animation: isVisible ? "scatterPop 0.4s ease 700ms both" : "none" }} />
            <circle cx="455" cy="45" r="5" fill="#fff" />
            <text x="466" y="41" fontSize="8" fill="#08316e" fontWeight="700">820</text>
            <circle cx="490" cy="50" r="6" fill="#0aad6a" opacity=".85" style={{ animation: isVisible ? "scatterPop 0.4s ease 740ms both" : "none" }} />
          </svg>
        </div>
      </div>
      </div>
      {/* Légende */}
      <div className="flex gap-3 mx-5 my-2 text-[10px] text-[#7a90b8] flex-wrap">
        {[["#0aad6a", "Gain (+5 à +20 pts)"], ["#e03050", "Perte (−5 à −15 pts)"], ["#c8960a", "Badge obtenu"], ["#08316e", "Score actuel"]].map(([c, l]) => (
          <div key={l} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: c }} />{l}
          </div>
        ))}
      </div>
      <TrendMsg variant="up" icon={<FaRocket className="text-[#0aad6a]" />}>
        <strong>Tendance nettement haussière sur 30 jours (+225 pts).</strong>{" "}
        Vos 3 meilleures semaines ont coïncidé avec plus de 4 trajets hebdomadaires — continuez ce rythme pour atteindre le rang #25.
      </TrendMsg>
    </div>
  );
}

export default ScatterProgression;
