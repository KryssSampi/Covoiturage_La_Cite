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
  const score = currentScore ?? 820;
  const maxScore = 1000;
  const finalAngle = (score / maxScore) * 180;

  const controls = useAnimation();
  const appState = useAppState();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  const playAnimation = useReactCallback(async () => {
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
    });
  }, [controls, finalAngle]);

  useEffect(() => {
    const currentContainer = containerRef.current;
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            playAnimation();
            setHasAnimated(true);
          }
        });
      },
      { threshold: 0.3 }
    );
    if (currentContainer) {
      observer.observe(currentContainer);
    }
    return () => {
      if (currentContainer) {
        observer.unobserve(currentContainer);
      }
    };
  }, [hasAnimated, playAnimation]);

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center justify-center p-4 md:p-8">
      <div className="relative w-full h-full flex items-center justify-center"
        onMouseEnter={() => {
          playAnimation();
          setHasAnimated(true);
        }}
        onMouseLeave={() => setHasAnimated(false)}
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
          className={`absolute ${appState.userConnected?.role?.toString() === "driver" ? "top-30 right-10" : "top-20 right-5"} mx-auto inset-0 flex items-center justify-center`}
          style={{ transformOrigin: "65% 60%" }}
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
    </div>
  );
}
