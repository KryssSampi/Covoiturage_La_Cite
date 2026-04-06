// features/auth/components/PasswordStep.tsx
// Composant pour l'étape de saisie du mot de passe dans le flux d'authentification.
import React, { useState, useEffect, useRef } from 'react';
import { useAuthSession } from '../hooks/useAuthSession';
import ErrorMessage from './ErrorMessage';

export default function PasswordStep({ auth, isFr }: { auth: ReturnType<typeof useAuthSession>; isFr: boolean }) {
  const [password, setPassword] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    auth.submitPassword(password);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <button
          type="button"
          onClick={auth.goBackToEmail}
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {isFr ? 'Changer d\'email' : 'Change email'}
        </button>
      </div>

      <div className="text-center">
        <h2 className="text-3xl font-semibold text-gray-900">
          {isFr ? 'Connexion' : 'Sign in'}
        </h2>
        <p className="mt-1 text-xl text-gray-500">{auth.email}</p>
      </div>

      <div>
        <label htmlFor="auth-password" className="mb-1 block text-sm font-medium text-gray-700">
          {isFr ? 'Mot de passe' : 'Password'}
        </label>
        <input
          ref={inputRef}
          id="auth-password"
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); }}
          placeholder="••••••••"
          disabled={auth.isLoading}
          autoComplete="current-password"
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
          ? (isFr ? 'Connexion...' : 'Signing in...')
          : (isFr ? 'Se connecter' : 'Sign in')}
      </button>
    </form>
  );
}
