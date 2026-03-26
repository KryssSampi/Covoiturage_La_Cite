import { useState, useEffect } from 'react'
import { Language } from '@/core/state/app_state'
import {
  getHomepageStats as getHomepageStatsContent,
  getLocalizedHomepageStatLabel,
  type HomepageStat as Stat,
} from '@/core/services/homepage-content.service'

interface HomepageStats {
  stats: Stat[]
  isLoading: boolean
}

export function useHomepageStats(): HomepageStats {
  const [stats] = useState<Stat[]>(getHomepageStatsContent())
  const [isLoading] = useState(false)

  useEffect(() => {
  }, [])

  return {
    stats,
    isLoading,
  }
}

export function getStatLabel(stat: Stat, lang: Language): string {
  return getLocalizedHomepageStatLabel(stat, lang)
}
