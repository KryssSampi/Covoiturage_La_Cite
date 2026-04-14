// features/auth/components/EmailStep.tsx
// Composant pour l'étape de saisie de l'email dans le flux d'authentification.
import React, { useEffect, useRef } from 'react';
import { useAuthSession } from '../hooks/useAuthSession';
import ErrorMessage from './ErrorMessage';

export default function EmailStep({ auth, isFr }: { auth: ReturnType<typeof useAuthSession>; isFr: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    auth.submitEmail(auth.email);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="text-center w-full">
        <h2 className="text-5xl font-semibold text-[#08316e]">
          {isFr ? 'Bienvenue!' : 'Welcome!'}
        </h2>
         <p className="mt-1 text-md text-gray-800">
          {isFr
            ? 'Sur la plateforme de Covoiturage de votre communauté collégiale.'
              : 'Enter your institutional email address to continue.'}
          </p>
      </div>

      <div>
        <label htmlFor="auth-email" className="mb-1 block text-sm font-medium text-gray-700">
              {isFr
            ? 'Entrez votre Courriel de la cité pour continuer :'
              : 'Enter your institutional email address to continue.'}
        </label>
        <input
          ref={inputRef}
          id="auth-email"
          type="email"
          value={auth.email}
          onChange={(e) => auth.setEmail(e.target.value)}
          placeholder="prenom.nom@collegelacite.ca"
          disabled={auth.isLoading}
          autoComplete="email"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400
                     focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                     disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      <ErrorMessage message={auth.error} />

      <button
        type="submit"
        disabled={auth.isLoading}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white
                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      >
        {auth.isLoading
          ? (isFr ? 'Vérification...' : 'Verifying...')
          : (isFr ? 'Continuer' : 'Continue')}
      </button>
    </form>
  );
}
