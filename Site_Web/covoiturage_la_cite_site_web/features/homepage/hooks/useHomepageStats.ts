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
  const [stats, setStats] = useState<Stat[]>(getHomepageStatsContent())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const res = await fetch('/api/platform-stats', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json() as {
          totalUsers?: number
          totalTrips?: number
          totalCo2SavedKg?: number
        }
        const staticStats = getHomepageStatsContent()
        const updated = staticStats.map((s) => {
          if (s.labelFr.includes('Utilisateur') && data.totalUsers) {
            return { ...s, value: `${data.totalUsers.toLocaleString('fr-CA')}+` }
          }
          if (s.labelFr.includes('Trajet') && data.totalTrips) {
            return { ...s, value: `${data.totalTrips.toLocaleString('fr-CA')}+` }
          }
          if (s.labelFr.includes('CO2') && data.totalCo2SavedKg) {
            const tonnes = (data.totalCo2SavedKg / 1000).toFixed(1)
            return { ...s, value: `${tonnes}T` }
          }
          return s
        })
        setStats(updated)
      } catch {
        // Fallback silencieux — valeurs statiques conservées
      } finally {
        setIsLoading(false)
      }
    }
    void load()
  }, [])

  return { stats, isLoading }
}

export function getStatLabel(stat: Stat, lang: Language): string {
  return getLocalizedHomepageStatLabel(stat, lang)
}
