// features/auth/components/ErrorMessage.tsx
// Composant pour afficher un message d'erreur dans le flux d'authentification.
import React from 'react';

export default function ErrorMessage({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
      {message}
    </p>
  );
}
