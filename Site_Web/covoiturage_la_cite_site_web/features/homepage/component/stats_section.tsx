'use client'

import { useAppState } from '@/core/state/app_state'
import { useHomepageStats, getStatLabel } from '../hooks/useHomepageStats'

export function StatsSection() {
  const appState = useAppState()
  const { stats, isLoading } = useHomepageStats()

  if (isLoading) {
    return (
      <div className="w-full h-75 flex gap-x-30 items-center justify-center bg-[#ffffff]">
        <p className="text-2xl text-gray-500">Chargement des statistiques...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-75 lg:flex grid grid-cols-2 lg:scale-100 scale-85 text-center gap-x-30 items-center justify-center bg-[#ffffff]">
      {stats.map((stat, index) => (
        <div key={index} className="flex flex-col items-center justify-center">
          <h3 className="lg:text-7xl text-5xl font-bold text-[#08316E]">{stat.value}</h3>
          <p className="lg:text-3xl text-xl font-semibold text-[#08316E]">
            {getStatLabel(stat, appState.lang)}
          </p>
        </div>
      ))}
    </div>
  )
}