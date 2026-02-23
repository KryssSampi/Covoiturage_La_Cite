import { useState, useEffect } from 'react'
import { Language } from '@/core/state/app_state'

interface Stat {
  value: string
  labelFr: string
  labelEn: string
}

interface HomepageStats {
  stats: Stat[]
  isLoading: boolean
}

/**
 * Hook pour gérer les statistiques de la homepage
 * 
 * TODO: Remplacer les données statiques par un appel API
 * vers le Core API pour récupérer les vraies statistiques
 */
export function useHomepageStats(): HomepageStats {
  const [stats] = useState<Stat[]>([
    {
      value: '500+',
      labelFr: 'Utilisateurs Inscrits',
      labelEn: 'Registered Users',
    },
    {
      value: '1200+',
      labelFr: 'Trajets Partagés',
      labelEn: 'Rides Shared',
    },
    {
      value: '50%',
      labelFr: 'Économies moyenne',
      labelEn: 'Average Savings',
    },
    {
      value: '2.5T',
      labelFr: 'CO₂ Évité',
      labelEn: 'CO₂ Avoided',
    },
  ])
  
  const [isLoading] = useState(false)

  useEffect(() => {
    // TODO: Appel API pour récupérer les vraies stats
    // const fetchStats = async () => {
    //   setIsLoading(true)
    //   try {
    //     const response = await fetch('/api/stats')
    //     const data = await response.json()
    //     setStats(data)
    //   } catch (error) {
    //     console.error('Error fetching stats:', error)
    //   } finally {
    //     setIsLoading(false)
    //   }
    // }
    // fetchStats()
  }, [])

  return {
    stats,
    isLoading,
  }
}

/**
 * Helper pour obtenir le label dans la bonne langue
 */
export function getStatLabel(stat: Stat, lang: Language): string {
  return lang === Language.FR ? stat.labelFr : stat.labelEn
}
