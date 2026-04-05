'use client';

import { use, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppState } from '@/core/state/app_state';
import OnboardingSlider from '@/features/onboarding/components/OnboardingSlider';
import type { OnboardingStep } from '@/features/onboarding/hooks/useOnboarding';

interface Props {
  params: Promise<{ id: string }>;
}

export default function OnboardingPage({ params }: Props) {
  const { id } = use(params);
  const appState = useAppState();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirige vers le login si non authentifié
  useEffect(() => {
    if (appState.userConnected === null) {
      router.replace('/login');
    }
  }, [appState.userConnected, router]);

  // Redirige si l'onboarding est déjà complété (retour accidentel)
  useEffect(() => {
    if (appState.userConnected && appState.userConnected.id !== id) {
      const { role, id: uid } = appState.userConnected;
      router.replace(`/${role}/${uid}`);
    }
  }, [appState.userConnected, id, router]);

  if (!appState.userConnected) return null;

  // Read optional start parameter to jump directly to a driver step
  const start = searchParams?.get('start') ?? undefined;
  const initialRole = start === 'vehicle' ? 'driver' : undefined;
  const startStep: OnboardingStep | undefined = start === 'vehicle' ? 'vehicle' : undefined;

  return <OnboardingSlider userId={id} initialRole={initialRole} startStep={startStep} />;
}
