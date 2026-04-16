"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useAnimation } from "framer-motion"
import Image from "next/image"
import { useAppState } from "@/core/state/app_state"
import { useCallback as useReactCallback } from "react"

type Props = {
  currentScore?: number
}

export function GoScoreDial({ currentScore }: Props = {}) {
  const score = currentScore ?? 820
  const maxScore = 1000
  const finalAngle = (score / maxScore) * 180

  const score = currentScore ?? 820;
  const maxScore = 1000;
  const finalAngle = (score / maxScore) * 180;

  const controls = useAnimation();
  const appState = useAppState();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  // ...existing code...

  // Ajout du conteneur responsive
  return (
    <div ref={containerRef} className="w-full flex flex-col items-center justify-center p-4 md:p-8">
      {/* ...le reste du composant... */}
    </div>
  );
      ref={containerRef}
      onMouseEnter={() => {
        playAnimation()
        setHasAnimated(true)
      }}
      onMouseLeave={()=>setHasAnimated(false)}
      className="relative w-full h-full flex items-center justify-center"
    >
      <Image
        src="/assets/goscore-dial/goscore-dial.png"
        alt="Go Score Dial"
        width={500}
        height={300}
        className="w-full h-full"
      />

<motion.div
  initial={{ rotate: 90 }}
  animate={controls}
  className={`absolute  ${appState.userConnected?.role.toString() === "driver" ? "top-30 right-10" : "top-20 right-5 "} mx-auto inset-0 flex items-center justify-center`}
  style={{ transformOrigin: "65% 60%" }} // 15% depuis la droite
>
  <Image
    src="/assets/goscore-dial/goscore-needle.png"
    alt="Needle"
    width={50}
    height={50}
    className="w-1/2 h-auto p-1"
  />
</motion.div>
    </div>
  )
}
