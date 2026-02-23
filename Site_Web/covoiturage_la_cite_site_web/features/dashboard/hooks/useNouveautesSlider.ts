import { useState } from "react";

/**
 * Collection de présets de transitions d'animation pour le curseur carrousel Nouveautés.
 * Chaque preset définit les états d'animation Framer Motion (initial, animate, exit)
 * pour différents effets visuels appliqués aux diapositives du carrousel.
 *
 * @constant
 * @type {Array<{initial: object, animate: object, exit: object}>}
 *
 * @description
 * - **Fondu + Zoom**: Fondu d'opacité avec changement d'échelle subtil pour une apparition/disparition fluide
 * - **Glissement Cube 3D**: Rotation en perspective 3D sur l'axe Y pour un effet de retournement de cube
 * - **Rotation dramatique**: Rotation et changement d'échelle combinés pour une entrée/sortie dynamique
 * - **Illusion de glissement divisé**: Révélation horizontale basée sur ClipPath pour un effet de portes coulissantes
 *
 * Utilisé par {@link useNouveautesSlider} pour appliquer des animations variées aux transitions du carrousel,
 * évitant la monotonie visuelle dans le curseur vidéo des nouveautés.
 *
 * @example
 * const selectedTransition = transitions[Math.floor(Math.random() * transitions.length)];
 * return <motion.div initial={selectedTransition.initial} animate={selectedTransition.animate} exit={selectedTransition.exit} />;
 */
const transitions: Array<{ initial: object; animate: object; exit: object; }> = [
  // Fade + Zoom
  {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.2 },
  },

  // Slide 3D Cube
  {
    initial: { rotateY: 90, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    exit: { rotateY: -90, opacity: 0 },
  },

  // Rotate dramatic
  {
    initial: { rotate: -15, scale: 0.9, opacity: 0 },
    animate: { rotate: 0, scale: 1, opacity: 1 },
    exit: { rotate: 15, scale: 1.1, opacity: 0 },
  },

  // Slide split illusion
  {
    initial: { clipPath: "inset(0 100% 0 0)" },
    animate: { clipPath: "inset(0 0% 0 0)" },
    exit: { clipPath: "inset(0 0 0 100%)" },
  },
]


/**
 * Hook for managing a slider component that cycles through novelties/updates.
 * Provides controls to navigate between slides with wraparound behavior.
 *
 * @returns {Object} An object containing slider state and navigation methods.
 * @returns {number} currentIndex - The index of the currently displayed slide.
 * @returns {Array} transitions - Array of transition items to cycle through.
 * @returns {Function} next - Function to advance to the next slide, wrapping around at the end.
 * @returns {Function} prev - Function to go to the previous slide, wrapping around at the start.
 */
function useNouveautesSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  return {
    currentIndex,
    transitions,
    next: () => setCurrentIndex((prev) => (prev + 1) % transitions.length),
    prev: () => setCurrentIndex((prev) => (prev - 1 + transitions.length) % transitions.length),
  };
}
export { useNouveautesSlider };