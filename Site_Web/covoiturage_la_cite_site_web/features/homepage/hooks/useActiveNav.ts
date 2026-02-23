import { useState } from 'react'

/**
 * Hook pour gérer la navigation active dans le Header
 * Gère l'état de l'onglet actif et le changement de path
 */
export function useActiveNav() {
  const [activePath, setActivePath] = useState('/')

  const setActive = (path: string) => {
    setActivePath(path)
  }

  return {
    activePath,
    setActive,
  }
}
