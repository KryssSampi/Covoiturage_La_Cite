import { Language } from '@/core/state/app_state'
import {
  getHomepageAdvantages,
  getLocalizedAdvantageDescription,
  getLocalizedAdvantageTitle,
  type Advantage,
} from '@/core/services/homepage-content.service'

export type { Advantage } from '@/core/services/homepage-content.service'

export function useAdvantages() {
  const advantages: Advantage[] = getHomepageAdvantages()

  const getTitle = (advantage: Advantage, lang: Language): string => {
    return getLocalizedAdvantageTitle(advantage, lang)
  }

  const getDescription = (advantage: Advantage, lang: Language): string => {
    return getLocalizedAdvantageDescription(advantage, lang)
  }

  return {
    advantages,
    getTitle,
    getDescription,
  }
}
