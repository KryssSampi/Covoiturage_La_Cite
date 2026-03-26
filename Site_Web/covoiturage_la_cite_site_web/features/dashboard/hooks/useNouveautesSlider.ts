import { useState } from "react";
import {
  getNextSliderIndex,
  getNouveautesSliderTransitions,
  getPreviousSliderIndex,
} from "@/core/services/nouveautes-slider.service";

function useNouveautesSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const transitions = getNouveautesSliderTransitions();

  return {
    currentIndex,
    transitions,
    next: () => setCurrentIndex((prev) => getNextSliderIndex(prev, transitions.length)),
    prev: () => setCurrentIndex((prev) => getPreviousSliderIndex(prev, transitions.length)),
  };
}

export { useNouveautesSlider };
