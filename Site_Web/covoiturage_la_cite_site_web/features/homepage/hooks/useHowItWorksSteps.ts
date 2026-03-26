import { Language } from '@/core/state/app_state'
import {
  getHomepageHowItWorksSteps,
  getLocalizedStepDescription,
  getLocalizedStepLinkText,
  getLocalizedStepTitle,
  type Step,
} from '@/core/services/homepage-content.service'

export type { Step } from '@/core/services/homepage-content.service'

export function useHowItWorksSteps() {
  const steps: Step[] = getHomepageHowItWorksSteps()

  const getTitle = (step: Step, lang: Language): string => {
    return getLocalizedStepTitle(step, lang)
  }

  const getDescription = (step: Step, lang: Language): string => {
    return getLocalizedStepDescription(step, lang)
  }

  const getLinkText = (step: Step, lang: Language): string | undefined => {
    return getLocalizedStepLinkText(step, lang)
  }

  return {
    steps,
    getTitle,
    getDescription,
    getLinkText,
  }
}
