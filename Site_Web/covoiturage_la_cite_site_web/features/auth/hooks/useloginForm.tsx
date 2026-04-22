'use client';

// features/auth/hooks/useLoginForm.ts
// Hook purement frontend : validation + délégation de l'authentification.
// Aucun appel API — le callback onLogin est injecté par la page parente.

import { useState } from 'react';
import { Language, useAppState, type ConnectedUser } from '@/core/state/app_state';
import { useRouter } from 'next/navigation';
import { useLoader } from '@/core/context/loader.context';

/** Réponse brute de POST /api/auth/signin */
export interface CoreUserResponse {
  id:              string;
  email:           string;
  firstName:       string;
  lastName:        string;
  role:            string;
  canBeDriver:     boolean;
  isActive:        boolean;
  profileVerified: boolean;
  avatarUrl?:      string | null;
}

/** Extrait uniquement les champs nécessaires à la session */
export function coreToConnectedUser(core: CoreUserResponse): ConnectedUser {
  return {
    id:          core.id,
    role:        String(core.role).toLowerCase(),
    firstName:   core.firstName,
    lastName:    core.lastName,
    avatarUrl:   core.avatarUrl ?? null,
    canBeDriver: core.canBeDriver,
  };
}

export type OnLoginCallback = (email: string) => Promise<CoreUserResponse>;

export function useLoginForm(onLogin?: OnLoginCallback) {
  const appState = useAppState();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setActiveLoader } = useLoader();

  const validateEmail = (email: string, lang: Language): boolean => {
    if (!email) {
      setError(lang === Language.FR ? 'Email requis' : 'Email required');
      return false;
    }
    if (!email.endsWith('@collegelacite.ca') && !email.endsWith('@la-citec.ca')) {
      setError(
        lang === Language.FR
          ? 'Veuillez utiliser votre adresse email du Collège la Cité.'
          : 'Please use your Collège la Cité email address.',
      );
      return false;
    }
    setError('');
    return true;
  };

  const handleLogin = async (lang: Language) => {
    if (!validateEmail(email, lang)) return;
    if (!onLogin) return;

    setIsLoading(true);
    setError('');

    try {
      const coreUser = await onLogin(email);
      const connected = coreToConnectedUser(coreUser);

      appState.login(connected);

        setActiveLoader(true);
        try {
          if (connected.role === 'admin') {
            await router.push('/admin');
          } else {
            await router.push(`/${connected.role}/${connected.id}`);
          }
        } finally {
          setActiveLoader(false);
        }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : lang === Language.FR ? 'Erreur de connexion' : 'Login error',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { email, setEmail, error, isLoading, handleLogin };
}
