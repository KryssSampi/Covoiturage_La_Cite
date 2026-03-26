export interface SliderTransitionPreset {
  initial: object;
  animate: object;
  exit: object;
}

const SLIDER_TRANSITIONS: SliderTransitionPreset[] = [
  {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.2 },
  },
  {
    initial: { rotateY: 90, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    exit: { rotateY: -90, opacity: 0 },
  },
  {
    initial: { rotate: -15, scale: 0.9, opacity: 0 },
    animate: { rotate: 0, scale: 1, opacity: 1 },
    exit: { rotate: 15, scale: 1.1, opacity: 0 },
  },
  {
    initial: { clipPath: 'inset(0 100% 0 0)' },
    animate: { clipPath: 'inset(0 0% 0 0)' },
    exit: { clipPath: 'inset(0 0 0 100%)' },
  },
];

export function getNouveautesSliderTransitions(): SliderTransitionPreset[] {
  return SLIDER_TRANSITIONS;
}

export function getNextSliderIndex(currentIndex: number, total: number): number {
  if (total <= 0) return 0;
  return (currentIndex + 1) % total;
}

export function getPreviousSliderIndex(currentIndex: number, total: number): number {
  if (total <= 0) return 0;
  return (currentIndex - 1 + total) % total;
}
