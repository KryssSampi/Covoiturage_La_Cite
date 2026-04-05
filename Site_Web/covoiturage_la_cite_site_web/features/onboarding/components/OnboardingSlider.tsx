'use client';

import { useRouter } from 'next/navigation';
import { useOnboarding, type OnboardingStep } from '../hooks/useOnboarding';
import PoliticsStep from './steps/PoliticsStep';
import RoleStep from './steps/RoleStep';
import PhoneStep from './steps/PhoneStep';
import VehicleInfoStep from './steps/VehicleInfoStep';
import VehiclePhotosStep from './steps/VehiclePhotosStep';
import VehicleDocumentsStep from './steps/VehicleDocumentsStep';
import ProfilePhotoStep from './steps/ProfilePhotoStep';

interface Props {
  userId: string;
  initialRole?: 'passenger' | 'driver';
  startStep?: OnboardingStep;
}

const STEP_LABELS: Record<OnboardingStep, string> = {
  politics: 'Politique',
  role: 'Rôle',
  phone: 'Téléphone',
  vehicle: 'Véhicule',
  vehiclePhotos: 'Photos',
  documents: 'Documents',
  profilePhoto: 'Photo de profil',
  done: 'Terminé',
};

function getOrderedSteps(role: 'passenger' | 'driver'): OnboardingStep[] {
  const base: OnboardingStep[] = ['politics', 'role', 'phone'];
  if (role === 'driver') base.push('vehicle', 'vehiclePhotos', 'documents');
  base.push('profilePhoto');
  return base;
}

export default function OnboardingSlider({ userId }: Props) {
  const router = useRouter();
  const onboarding = useOnboarding({ initialRole, startStep });
  const { step, formData, showAbandonWarning, confirmAbandonDriver, cancelAbandonDriver, goToPreviousStep } = onboarding;

  // Redirection quand terminé
  if (step === 'done') {
    const role = formData.role === 'driver' ? 'driver' : 'passenger';
    router.replace(`/${role}/${userId}`);
    return null;
  }

  const steps = getOrderedSteps(formData.role);
  const currentIndex = steps.indexOf(step);
  const totalSteps = steps.length;
  const progressPercent = totalSteps > 0 ? ((currentIndex + 1) / totalSteps) * 100 : 0;
  const canGoBack = currentIndex > 0;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* En-tête */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">
              Étape {currentIndex + 1} sur {totalSteps}
            </span>
            <span className="text-xs font-semibold text-blue-600">
              {STEP_LABELS[step]}
            </span>
          </div>

          {/* Barre de progression */}
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Pastilles d'étapes */}
          <div className="mt-3 flex justify-between">
            {steps.map((s, idx) => (
              <div
                key={s}
                className={`flex h-2 w-2 rounded-full transition-colors ${
                  idx < currentIndex ? 'bg-blue-500' : idx === currentIndex ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Carte du contenu */}
        <div className="rounded-2xl bg-white shadow-lg p-6">
          {/* Bouton retour */}
          {canGoBack && (
            <button
              type="button"
              onClick={goToPreviousStep}
              className="mb-4 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Retour
            </button>
          )}

          {/* Contenu de l'étape */}
          {step === 'politics' && <PoliticsStep onboarding={onboarding} />}
          {step === 'role' && <RoleStep onboarding={onboarding} />}
          {step === 'phone' && <PhoneStep onboarding={onboarding} />}
          {step === 'vehicle' && <VehicleInfoStep onboarding={onboarding} />}
          {step === 'vehiclePhotos' && <VehiclePhotosStep onboarding={onboarding} />}
          {step === 'documents' && <VehicleDocumentsStep onboarding={onboarding} />}
          {step === 'profilePhoto' && <ProfilePhotoStep onboarding={onboarding} />}
        </div>

        {/* Mention de progression */}
        <p className="mt-4 text-center text-xs text-gray-400">
          Collège La Cité — Covoiturage
        </p>
      </div>

      {/* Popup abandon conducteur */}
      {showAbandonWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="text-center mb-4">
              <span className="text-4xl">⚠️</span>
            </div>
            <h3 className="mb-2 text-center text-lg font-semibold text-gray-900">
              Abandonner l&apos;inscription conducteur ?
            </h3>
            <p className="mb-6 text-center text-sm text-gray-500">
              Si vous continuez, vous serez enregistré(e) comme passager uniquement.
              Vous pourrez proposer des trajets plus tard depuis votre profil.
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={confirmAbandonDriver}
                className="w-full rounded-lg bg-red-500 px-4 py-3 text-sm font-medium text-white hover:bg-red-600 transition-colors"
              >
                Continuer comme passager
              </button>
              <button
                type="button"
                onClick={cancelAbandonDriver}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Rester conducteur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
