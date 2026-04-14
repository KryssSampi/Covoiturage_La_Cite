'use client';

import { FaUser, FaCar } from 'react-icons/fa6';
import type { useOnboarding } from '../../hooks/useOnboarding';
import { Language, useAppState } from '@/core/state/app_state';

interface Props {
  onboarding: ReturnType<typeof useOnboarding>;
}

function getRoles(isFR: boolean) {
  return [
    {
      value: 'passenger' as const,
      label: isFR ? 'Passager' : 'Passenger',
      icon: <FaUser color='#08316e' />,
      description: isFR
        ? 'Je cherche du covoiturage pour mes trajets vers le campus.'
        : 'I am looking for carpooling for my trips to campus.',
    },
    {
      value: 'driver' as const,
      label: isFR ? 'Conducteur' : 'Driver',
      icon: <FaCar color='#08316e' />,
      description: isFR
        ? 'Je propose des places dans mon véhicule pour mes trajets.'
        : 'I offer seats in my vehicle for my trips.',
    },
  ];
}

function getSchoolRoles(isFR: boolean) {
  return [
    { value: 'Etudiant' as const, label: isFR ? 'Étudiant(e)' : 'Student' },
    { value: 'Professeur' as const, label: isFR ? 'Professeur(e)' : 'Professor' },
    { value: 'Administrateur' as const, label: isFR ? 'Administrateur / Personnel' : 'Administrator / Staff' },
  ];
}

export default function RoleStep({ onboarding }: Props) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;
  const { formData, setField, isLoading, error, submitRole } = onboarding;
  const ROLES = getRoles(isFR);
  const SCHOOL_ROLES = getSchoolRoles(isFR);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {isFR ? 'Votre rôle' : 'Your role'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {isFR
            ? "Comment souhaitez-vous principalement utiliser l'application ?"
            : 'How do you primarily want to use the application?'}
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
          {isFR
            ? "En tant que conducteur, vous devrez soumettre des informations sur votre véhicule et vos documents. Vous pourrez changer d'avis à tout moment."
            : 'As a driver, you will need to submit information about your vehicle and documents. You can change your mind at any time.'}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={submitRole}
        disabled={isLoading}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white
                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      >
        {isLoading
          ? (isFR ? 'Traitement...' : 'Processing...')
          : (isFR ? 'Continuer' : 'Continue')}
      </button>
    </div>
  );
}
