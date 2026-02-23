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

  const controls = useAnimation()
  const appState = useAppState()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  // 🎬 Animation dramatique
  const playAnimation = useReactCallback(async () => {
    // Lance la séquence d'animation avec rotations progressives
    await controls.start({
      rotate: [
        90,
        0,
        60,
        40,
        75,
        55,
        80,
        35,
        100,
        90,
        120,
        80,
        140,
        finalAngle + 20,
        finalAngle - 10,
        finalAngle + 10,
        finalAngle - 5,
        finalAngle
      ],
      transition: {
        duration: 4,
        ease: "easeInOut"
      }
    })
  }, [controls, finalAngle])

  // 👀 Intersection Observer (équateur écran)
  useEffect(() => {
    // Capture la valeur actuelle de la référence pour l'utiliser dans le nettoyage
    const currentContainer = containerRef.current

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            playAnimation()
          }
        })
      },
      {
        threshold: 0.3
      }
    )

    if (currentContainer) {
      observer.observe(currentContainer)
    }

    return () => {
      if (currentContainer) {
        observer.unobserve(currentContainer)
      }
    }
  }, [hasAnimated, playAnimation])

  return (
    <div
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
