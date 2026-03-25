"use client";

/**
 * DialGoScore — jauge arc SVG affichant le GoScore, le tier et le rang.
 * Animation dramatique de l'aiguille au scroll (IntersectionObserver) et au hover.
 * Le score est affiché par le parent, à côté du dial.
 */

import { useCallback, useEffect, useRef } from "react";
import { FaShieldHalved, FaStar, FaCircleCheck } from "react-icons/fa6";
import { motion, useAnimation } from "framer-motion";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";

// ─── Composant ──────────────────────────────────────────────────────────────

function DialGoScore({ score, tier, rang }: { score: number; tier: string; rang: number }) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const controls = useAnimation();
  const hasAnimated = useRef(false);

  /** Angle CW depuis "haut" (0° = nord, +90° = est, −90° = ouest)
   *  score 0 → −90° (gauche) | score 500 → 0° (haut) | score 1000 → +90° (droite) */
  const finalAngle = (score / 1000) * 180 - 90;

  /** Longueur d'arc remplie : 300 = total dasharray */
  const dashFilled  = 300 * (score / 1000);
  const dashOffset  = 300 - dashFilled; // offset = portion NON remplie à la fin

  /** Séquence d'animation identique au pattern GoScoreDial */
  const playAnimation = useCallback(async () => {
    await controls.start({
      rotate: [
        -90,
        -30, 20,
        -10, 40,
        10,  55,
        30,  finalAngle + 20,
        finalAngle - 8,
        finalAngle + 4,
        finalAngle - 2,
        finalAngle,
      ],
      transition: { duration: 2.5, ease: "easeInOut" },
    });
  }, [controls, finalAngle]);

  // Positionne l'aiguille à gauche avant l'animation
  useEffect(() => {
    controls.set({ rotate: -90 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Déclenche l'animation au scroll (une seule fois)
  useEffect(() => {
    if (isVisible && !hasAnimated.current) {
      hasAnimated.current = true;
      void playAnimation();
    }
  }, [isVisible, playAnimation]);

  return (
    <div
      ref={ref}
      className="p-4 text-center"
      onMouseEnter={() => void playAnimation()}
    >
      <div className="relative w-50 mx-auto">
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
          <path
            d="M 22 110 A 78 78 0 0 1 178 110"
            fill="none" stroke="rgba(8,49,110,0.09)" strokeWidth="13" strokeLinecap="round"
          />

          {/* Arc rempli — transition CSS sur le dashoffset */}
          <path
            d="M 22 110 A 78 78 0 0 1 178 110"
            fill="none" stroke="url(#arcG-go)" strokeWidth="13" strokeLinecap="round"
            strokeDasharray="300"
            strokeDashoffset={isVisible ? dashOffset : 300}
            style={{ transition: isVisible ? "stroke-dashoffset 1.2s ease 0.2s" : "none" }}
          />

          {/* Aiguille — motion.g pivoté autour du centre (100, 110) */}
          <motion.g
            initial={{ rotate: -90 }}
            animate={controls}
            style={{ transformOrigin: "100px 110px" }}
          >
            {/* Aiguille verticale (pointe vers le haut à rotation=0 → score 500) */}
            <line
              x1="100" y1="110" x2="100" y2="45"
              stroke="#08316e" strokeWidth="2.5" strokeLinecap="round" opacity=".9"
            />
          </motion.g>

          {/* Pivot central */}
          <circle cx="100" cy="110" r="6" fill="#fff" stroke="#08316e" strokeWidth="2" />
        </svg>

        {/* Tier + Rang sous l'arc */}
        <div className="text-[11px] text-[#7a90b8] mt-1 flex items-center justify-center gap-1">
          <FaCircleCheck className="text-[#0aad6a]" size={9} /> {tier} · Rang #{rang}
        </div>
      </div>

      {/* Chips de statut */}
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
