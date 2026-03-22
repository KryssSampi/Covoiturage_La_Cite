"use client";

/**
 * ScatterGainHeure — graphique scatter Gain $ × Heure de départ avec zoom pour la page Finances.
 */

import React from "react";
import { FaClock, FaMagnifyingGlass } from "react-icons/fa6";
import { useScrollReveal, useZoom } from "@/shared/hooks/useScrollReveal";
import CardHeader from "./ui/CardHeader";
import ZoomControls from "./ui/ZoomControls";
import TrendMsg from "./ui/TrendMsg";

// ─── Composant ──────────────────────────────────────────────────────────────

function ScatterGainHeure() {
  const { scale, zoomIn, zoomOut, reset } = useZoom(1, 1, 3, 0.3);
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });

  return (
    <div>
      <CardHeader
        dotColor="#0098c8"
        title="Gain $ × Heure de départ"
        right={<ZoomControls onPlus={zoomIn} onMinus={zoomOut} onReset={reset} />}
      />
      {/* Conteneur hauteur fixe — la carte ne grandit pas au zoom */}
      <div className="overflow-hidden mx-5 my-3 rounded-[10px] border border-[rgba(8,49,110,0.09)]" style={{ aspectRatio: "340/180" }}>
      <div
        className="zoom-wrap overflow-auto h-full bg-[#f0f4fb]"
      >
        <div
          ref={ref}
          className="px-5 py-3"
          style={{ transform: `scale(${scale})`, transformOrigin: "top left", transition: "transform 0.3s", width: `${100 / scale}%` }}
        >
          <svg viewBox="0 0 340 180" xmlns="http://www.w3.org/2000/svg" className="w-full block">
            {/* Axes */}
            <line x1="38" y1="10" x2="38" y2="155" stroke="#c8d4ec" strokeWidth="1" />
            <line x1="38" y1="155" x2="330" y2="155" stroke="#c8d4ec" strokeWidth="1" />
            {/* Grille H */}
            {[120, 85, 50, 20].map((y) => (
              <line key={y} x1="38" y1={y} x2="330" y2={y} stroke="#e8edf8" strokeWidth="1" strokeDasharray="3,3" />
            ))}
            {/* Grille V */}
            {[80, 130, 180, 230, 280].map((x) => (
              <line key={x} x1={x} y1="10" x2={x} y2="155" stroke="#e8edf8" strokeWidth="1" strokeDasharray="3,3" />
            ))}
            {/* Labels Y */}
            {([["+155", "5$"], ["120", "15$"], ["85", "25$"], ["50", "35$"], ["20", "45$"]] as const).map(([y, l]) => (
              <text key={y} x="32" y={Number(y.replace("+", ""))} textAnchor="end" fontSize="8" fill="#7a90b8">{l}</text>
            ))}
            {/* Labels X */}
            {(["06h", "07h", "08h", "12h", "17h", "18h", "19h"] as const).map((l, i) => {
              const xs = [57, 80, 130, 180, 230, 280, 315];
              return (
                <text key={l} x={xs[i]} y="167" textAnchor="middle" fontSize="8" fill="#7a90b8">{l}</text>
              );
            })}
            {/* Zone AM */}
            <rect x="60" y="8" width="100" height="140" rx="5" fill="rgba(8,49,110,0.04)" />
            <text x="110" y="6" textAnchor="middle" fontSize="8" fill="rgba(8,49,110,0.45)" fontWeight="700">Créneau AM</text>
            {/* Zone PM */}
            <rect x="215" y="8" width="115" height="140" rx="5" fill="rgba(200,150,10,0.05)" />
            <text x="272" y="6" textAnchor="middle" fontSize="8" fill="rgba(200,150,10,0.65)" fontWeight="700">PM</text>
            {/* Points AM (navy) */}
            <circle cx="57" cy="108" r="5" fill="#08316e" opacity=".75" style={{ animation: isVisible ? "scatterPop 0.4s ease 0.1s both" : "none" }} />
            <circle cx="80" cy="82" r="6" fill="#08316e" opacity=".85" style={{ animation: isVisible ? "scatterPop 0.4s ease 0.15s both" : "none" }} />
            <circle cx="108" cy="38" r="8" fill="#08316e" opacity=".9" style={{ animation: isVisible ? "scatterPop 0.4s ease 0.2s both" : "none" }} />
            <text x="118" y="35" fontSize="8" fill="#08316e" fontWeight="700">34$</text>
            {/* Points Midi (vert) */}
            <circle cx="125" cy="90" r="6" fill="#0aad6a" opacity=".82" style={{ animation: isVisible ? "scatterPop 0.4s ease 0.25s both" : "none" }} />
            <circle cx="145" cy="100" r="5" fill="#0aad6a" opacity=".78" style={{ animation: isVisible ? "scatterPop 0.4s ease 0.3s both" : "none" }} />
            {/* Point midi isolé (or) */}
            <circle cx="180" cy="125" r="3" fill="#c8960a" opacity=".7" style={{ animation: isVisible ? "scatterPop 0.4s ease 0.35s both" : "none" }} />
            {/* Points PM (or) */}
            <circle cx="230" cy="88" r="6" fill="#c8960a" opacity=".82" style={{ animation: isVisible ? "scatterPop 0.4s ease 0.4s both" : "none" }} />
            <circle cx="255" cy="72" r="5" fill="#c8960a" opacity=".85" style={{ animation: isVisible ? "scatterPop 0.4s ease 0.45s both" : "none" }} />
            <circle cx="280" cy="50" r="7" fill="#c8960a" opacity=".88" style={{ animation: isVisible ? "scatterPop 0.4s ease 0.5s both" : "none" }} />
            <text x="290" y="47" fontSize="8" fill="#c8960a" fontWeight="700">33$</text>
            <circle cx="315" cy="88" r="5" fill="#c8960a" opacity=".8" style={{ animation: isVisible ? "scatterPop 0.4s ease 0.55s both" : "none" }} />
          </svg>
        </div>
      </div>
      </div>
      {/* Légende */}
      <div className="flex gap-3 mx-5 mb-3.5 text-[10px] text-[#7a90b8] flex-wrap">
        {([["#08316e", "AM"], ["#0aad6a", "Midi"], ["#c8960a", "PM"]] as const).map(([c, l]) => (
          <div key={l} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: c }} />{l}
          </div>
        ))}
        <span className="text-[#aaa] flex items-center gap-1"><FaMagnifyingGlass size={8} /> Zoom avec ＋ / －</span>
      </div>
      <TrendMsg variant="stable" icon={<FaClock className="text-[#08316e]" />}>
        <strong>Le créneau 08h–09h est le plus rentable</strong> avec un pic à 34 $ par trajet.
        Le soir (17h–19h) reste également compétitif — les deux sont vos fenêtres optimales.
      </TrendMsg>
    </div>
  );
}

export default ScatterGainHeure;
