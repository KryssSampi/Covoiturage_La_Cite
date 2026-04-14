'use client';

/**
 * IdentityVerificationStep
 *
 * Composant conteneur qui orchestre la vérification d'identité.
 * Utilise le hook `useIdentityVerification` pour la logique métier
 * et le composant `IdentityVerificationForm` pour le rendu UI.
 */

import type { useOnboarding } from '../../hooks/useOnboarding';
import { useIdentityVerification } from '../../hooks/useIdentityVerification';
import IdentityVerificationForm from './IdentityVerificationForm';

interface Props {
  onboarding: ReturnType<typeof useOnboarding>;
}

export default function IdentityVerificationStep({ onboarding }: Props) {
  const verification = useIdentityVerification(onboarding);

  return <IdentityVerificationForm {...verification} />;
}
