'use client';

import { useEffect } from 'react';
import { AuthSessionLogin } from '@/features/auth/components/AuthSessionLogin';
import { useAppState, type ConnectedUser } from '@/core/state/app_state';
import { useRouter } from 'next/navigation';
import { useLoader } from '@/core/context/loader.context';
import type { AuthLoginUser } from '@/features/auth/hooks/useAuthSession';

export default function LoginPage() {
  const appState = useAppState();
  const router = useRouter();
  const { setActiveLoader } = useLoader();

  useEffect(() => {
    setActiveLoader(false);
  }, [setActiveLoader]);

  // Redirection si déjà connecté
  useEffect(() => {
    if (appState.userConnected) {
      const { role, id, onboardingCompleted } = appState.userConnected;
      setActiveLoader(true);
      if (!onboardingCompleted) {
        router.replace(`/onboarding/${id}`);
      } else {
        router.replace(`/${role}/${id}`);
      }
    }
  }, [appState.userConnected, router, setActiveLoader]);

  const handleLoginSuccess = (user: AuthLoginUser) => {
    const connected: ConnectedUser = {
      id: user.id,
      role: String(user.role).toLowerCase(),
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl ?? null,
      canBeDriver: user.canBeDriver,
      onboardingCompleted: user.onboardingCompleted,
    };

    appState.login(connected);
    setActiveLoader(true);
    // Navigation centralisée dans le useEffect (évite les courses concurrents)
  };

  return (
    <div className="flex items-center justify-center px-4">
      <div className="w-full">
        <AuthSessionLogin onLoginSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
}
