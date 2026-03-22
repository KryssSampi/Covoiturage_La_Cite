// features/auth/hooks/useLoginForm.ts
'use client'

import { useState } from 'react'
import { Language, useAppState } from '@/core/state/app_state'
import { UserModel as DomainUserModel } from '@/domain/models/UserModel'
import { useRouter } from 'next/navigation'
import { useLoader } from '@/core/context/loader.context'

/** Forme renvoyée par la route /api/auth/signin (UserModel core, sanitisé) */
interface CoreUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  canBeDriver: boolean;
  isActive: boolean;
  profileVerified: boolean;
  avatarUrl?: string;
}

/** Convertit le UserModel core (JSON DB) en UserModel domaine (AppState) */
function coreUserToDomainUser(core: CoreUserResponse): DomainUserModel {
  return new DomainUserModel({
    id:               core.id,
    email:            core.email,
    nom:              core.lastName,
    prenom:           core.firstName,
    role:             core.role,
    can_be_driver:    core.canBeDriver,
    is_active:        core.isActive,
    profile_verified: core.profileVerified,
    photo_url:        core.avatarUrl ?? null,
  });
}

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
    if (!validateEmail(email, lang)) return;

    setIsLoading(true)
    setError('')

    try {
      // Appel à la route API d'authentification — remplace les Testusers
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = (data as { error?: string }).error;
        if (res.status === 404) {
          setError(lang === Language.FR ? 'Utilisateur non trouvé' : 'User not found');
        } else if (res.status === 403) {
          setError(lang === Language.FR ? 'Compte désactivé' : 'Account disabled');
        } else {
          setError(msg ?? (lang === Language.FR ? 'Erreur de connexion' : 'Login error'));
        }
        return;
      }

      const coreUser: CoreUserResponse = await res.json();
      const domainUser = coreUserToDomainUser(coreUser);

      // Connexion via AppState (gère automatiquement sessionStorage)
      appState.login(domainUser);

      // Redirection après succès
      setActiveLoader(true);
      router.push(`/${coreUser.role.toLowerCase()}/${coreUser.id}`);

    } catch {
      setError(lang === Language.FR ? 'Erreur de connexion' : 'Login error');
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