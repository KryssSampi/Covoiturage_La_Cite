// features/auth/hooks/useLoginForm.ts
'use client'

import { useState } from 'react'
import { Language, useAppState } from '@/core/state/app_state'
import { Testusers } from '@/tests/fixtures/testdata'
import { useRouter } from 'next/navigation'
import { useLoader } from '@/core/context/loader.context'

export function useLoginForm() {
  const appState = useAppState()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { setActiveLoader } = useLoader();

  const validateEmail = (email: string, lang: Language): boolean => {
    if (!email) {
      setError(lang === Language.FR ? 'Email requis' : 'Email required')
      return false
    }

    if (!email.endsWith('@collegelacite.ca') && !email.endsWith('@la-citec.ca')) {
      const message = lang === Language.FR 
        ? 'Veuillez utiliser votre adresse email du Collège la Cité.'
        : 'Please use your Collège la Cité email address.'
      setError(message)
      return false
    }

    setError('')
    return true
  }

  const handleLogin = async (lang: Language) => {
    // Validation
    if (!validateEmail(email, lang)) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Simuler un délai réseau (retirer en prod)
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Rechercher l'utilisateur dans les données de test
      const user = Testusers.find(u => u.email === email)

      if (!user) {
        setError(lang === Language.FR ? 'Utilisateur non trouvé' : 'User not found')
        return
      }

      // Connexion via AppState (gère automatiquement sessionStorage)
      appState.login(user)

      // Redirection après succès
      setActiveLoader(true); // Affiche le loader de redirection
      router.push(`/${user.role.toString().toLowerCase()}/${user.id}`)
      
      console.log('✅ Connexion réussie:', user.nom)

    } catch (err) {
      console.error('❌ Erreur de connexion:', err)
      setError(lang === Language.FR ? 'Erreur de connexion' : 'Login error')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    email,
    setEmail,
    error,
    isLoading,
    handleLogin,
  }
}