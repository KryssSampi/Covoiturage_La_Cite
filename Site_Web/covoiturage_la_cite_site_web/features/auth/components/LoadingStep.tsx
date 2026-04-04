// features/auth/components/LoadingStep.tsx
// Composant pour l'étape de chargement de l'authentification.
import React from 'react';

export default function LoadingStep({ isFr }: { isFr: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
      <p className="text-sm text-gray-500">
        {isFr ? 'Initialisation...' : 'Initializing...'}
      </p>
    </div>
  );
}
