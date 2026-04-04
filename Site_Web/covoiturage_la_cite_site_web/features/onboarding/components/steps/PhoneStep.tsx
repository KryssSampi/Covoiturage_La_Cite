'use client';

import { useRef, useEffect } from 'react';
import type { useOnboarding } from '../../hooks/useOnboarding';

interface Props {
  onboarding: ReturnType<typeof useOnboarding>;
}

export default function PhoneStep({ onboarding }: Props) {
  const { formData, setField, isLoading, error, submitPhone } = onboarding;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitPhone();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Votre numéro de téléphone</h2>
        <p className="mt-1 text-sm text-gray-500">
          Pour être contacté(e) par vos passagers ou votre conducteur.
        </p>
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
          Numéro de téléphone
        </label>
        <input
          ref={inputRef}
          id="phone"
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => setField('phoneNumber', e.target.value)}
          placeholder="514-555-0100"
          autoComplete="tel"
          disabled={isLoading}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400
                     focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                     disabled:bg-gray-50 disabled:text-gray-500"
        />
        <p className="mt-1 text-xs text-gray-400">
          Visible uniquement par vos partenaires de trajet confirmés.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isLoading || !formData.phoneNumber.trim()}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white
                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      >
        {isLoading ? 'Traitement...' : 'Continuer'}
      </button>
    </form>
  );
}
