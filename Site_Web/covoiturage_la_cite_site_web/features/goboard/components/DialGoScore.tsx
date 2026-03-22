"use client";

/**
 * DialGoScore — jauge arc SVG affichant le GoScore, le tier et le rang.
 */

import React from "react";
import { FaShieldHalved, FaStar, FaCircleCheck } from "react-icons/fa6";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";

// ─── Composant ──────────────────────────────────────────────────────────────

function DialGoScore({ score, tier, rang }: { score: number; tier: string; rang: number }) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  /* Arc : 245 total dash, 820/1000 → dashoffset = 245 * (1–0.82) ≈ 44 */
  const dashOffset = isVisible ? 44 : 245;

  return (
    <div ref={ref} className="p-5 text-center">
      <div className="relative w-50 h-29.5 mx-auto">
        <svg viewBox="0 0 200 118" xmlns="http://www.w3.org/2000/svg" width="200" height="118">
          <defs>
            <linearGradient id="arcG-go" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#e03050" />
              <stop offset="28%"  stopColor="#c8960a" />
              <stop offset="65%"  stopColor="#0aad6a" />
              <stop offset="100%" stopColor="#0098c8" />
            </linearGradient>
          </defs>
          {/* Piste de fond */}
          <path d="M 22 110 A 78 78 0 0 1 178 110" fill="none" stroke="rgba(8,49,110,0.09)" strokeWidth="13" strokeLinecap="round" />
          {/* Arc rempli */}
          <path
            d="M 22 110 A 78 78 0 0 1 178 110" fill="none" stroke="url(#arcG-go)" strokeWidth="13" strokeLinecap="round"
            strokeDasharray="245" strokeDashoffset={dashOffset}
            style={{ transition: isVisible ? "stroke-dashoffset 1.2s ease 0.2s" : "none" }}
          />
          {/* Aiguille */}
          <line
            x1="100" y1="110" x2="32" y2="30"
            stroke="#08316e" strokeWidth="2.5" strokeLinecap="round" opacity=".9"
            style={{
              transformOrigin: "100px 110px",
              transform: isVisible ? "rotate(0deg)" : "rotate(-80deg)",
              transition: isVisible ? "transform 1.2s ease 0.3s" : "none",
            }}
          />
          <circle cx="100" cy="110" r="6" fill="#fff" stroke="#08316e" strokeWidth="2" />
        </svg>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center w-45">
          <div className="font-[Syne] font-extrabold text-[38px] text-[#0aad6a] leading-none">{score}</div>
          <div className="text-xs font-bold text-[#0aad6a] mt-0.5">
            Hyper GO<span className="text-[#08316e]">oooo</span>!
          </div>
          <div className="text-[10px] text-[#7a90b8] mt-0.5 flex items-center justify-center gap-1">
            <FaCircleCheck className="text-[#0aad6a]" size={9} /> {tier} · Rang #{rang}
          </div>
        </div>
      </div>
      {/* Chips sous le dial */}
      <div className="flex justify-center gap-1.5 flex-wrap mt-3">
        {[
          { icon: <FaShieldHalved size={9} />, text: "Fiable",             bg: "rgba(10,173,106,0.1)",  color: "#0aad6a" },
          { icon: <FaStar size={9} />,         text: "Priorité",           bg: "rgba(200,150,10,0.09)", color: "#c8960a" },
          { icon: <FaCircleCheck size={9} />,  text: "Aucune restriction", bg: "rgba(8,49,110,0.13)",   color: "#08316e" },
        ].map((c) => (
          <span
            key={c.text}
            className="flex items-center gap-1 text-[9px] font-bold px-2.5 py-0.5 rounded-md"
            style={{ background: c.bg, color: c.color }}
          >
            {c.icon} {c.text}
          </span>
        ))}
      </div>
    </div>
  );
}

export default DialGoScore;
