'use client';

import type { useOnboarding } from '../../hooks/useOnboarding';

interface Props {
  onboarding: ReturnType<typeof useOnboarding>;
}

const ROLES = [
  {
    value: 'passenger' as const,
    label: 'Passager',
    icon: '🧑‍💼',
    description: 'Je cherche du covoiturage pour mes trajets vers le campus.',
  },
  {
    value: 'driver' as const,
    label: 'Conducteur',
    icon: '🚗',
    description: 'Je propose des places dans mon véhicule pour mes trajets.',
  },
];

const SCHOOL_ROLES = [
  { value: 'Etudiant' as const, label: 'Étudiant(e)' },
  { value: 'Professeur' as const, label: 'Professeur(e)' },
  { value: 'Administrateur' as const, label: 'Administrateur / Personnel' },
];

export default function RoleStep({ onboarding }: Props) {
  const { formData, setField, isLoading, error, submitRole } = onboarding;

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Votre rôle</h2>
        <p className="mt-1 text-sm text-gray-500">
          Comment souhaitez-vous principalement utiliser l&apos;application ?
        </p>
      </div>

      {/* Sélection rôle principale */}
      <div className="grid grid-cols-2 gap-3">
        {ROLES.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => setField('role', r.value)}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all
              ${formData.role === r.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
          >
            <span className="text-3xl">{r.icon}</span>
            <span className="font-semibold text-gray-900 text-sm">{r.label}</span>
            <span className="text-xs text-gray-500">{r.description}</span>
          </button>
        ))}
      </div>

      {/* Conducteur : avertissement */}
      {formData.role === 'driver' && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          En tant que conducteur, vous devrez soumettre des informations sur votre véhicule et vos documents. Vous pourrez changer d&apos;avis à tout moment.
        </div>
      )}

      {/* Rôle scolaire */}
      <div>
        <p className="mb-3 text-sm font-medium text-gray-700">Mon rôle à La Cité</p>
        <div className="flex flex-col gap-2">
          {SCHOOL_ROLES.map((sr) => (
            <label
              key={sr.value}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 px-4 py-3 transition-all
                ${formData.schoolRole === sr.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
            >
              <input
                type="radio"
                name="schoolRole"
                value={sr.value}
                checked={formData.schoolRole === sr.value}
                onChange={() => setField('schoolRole', sr.value)}
                className="h-4 w-4 accent-blue-600"
              />
              <span className="text-sm font-medium text-gray-800">{sr.label}</span>
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={submitRole}
        disabled={isLoading}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white
                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      >
        {isLoading ? 'Traitement...' : 'Continuer'}
      </button>
    </div>
  );
}
