'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useOnboarding, type OnboardingStep } from '../hooks/useOnboarding';
import { Language, useAppState } from '@/core/state/app_state';
import PoliticsStep from './steps/PoliticsStep';
import RoleStep from './steps/RoleStep';
import PhoneStep from './steps/PhoneStep';
import VehicleInfoStep from './steps/VehicleInfoStep';
import VehiclePhotosStep from './steps/VehiclePhotosStep';
import VehicleDocumentsStep from './steps/VehicleDocumentsStep';
import ProfilePhotoStep from './steps/ProfilePhotoStep';
import IdentityVerificationStep from './steps/IdentityVerificationStep';

interface Props {
  userId: string;
  initialRole?: 'passenger' | 'driver';
  startStep?: OnboardingStep;
}

function getStepLabels(isFR: boolean): Record<OnboardingStep, string> {
  return {
    politics: isFR ? 'Politique' : 'Policy',
    role: isFR ? 'Rôle' : 'Role',
    phone: isFR ? 'Téléphone' : 'Phone',
    vehicle: isFR ? 'Véhicule' : 'Vehicle',
    vehiclePhotos: isFR ? 'Photos' : 'Photos',
    documents: isFR ? 'Documents' : 'Documents',
    profilePhoto: isFR ? 'Photo de profil' : 'Profile photo',
    faceVerification: isFR ? "Vérification d'identité" : 'Identity verification',
    done: isFR ? 'Terminé' : 'Done',
  };
}

function getOrderedSteps(role: 'passenger' | 'driver'): OnboardingStep[] {
  const base: OnboardingStep[] = ['politics', 'role', 'phone'];
  if (role === 'driver') base.push('vehicle', 'vehiclePhotos', 'documents');
  base.push('profilePhoto', 'faceVerification');
  return base;
}

export default function OnboardingSlider({ userId, initialRole, startStep }: Props) {
  const router = useRouter();
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;
  const onboarding = useOnboarding({ initialRole, startStep });
  const { step, formData, showAbandonWarning, confirmAbandonDriver, cancelAbandonDriver, goToPreviousStep } = onboarding;
  const STEP_LABELS = getStepLabels(isFR);

  // Redirection quand terminé — effectuer la navigation dans useEffect
  useEffect(() => {
    if (step !== 'done') return;
    const role = formData.role === 'driver' ? 'driver' : 'passenger';
    router.replace(`/${role}/${userId}`);
  }, [step, formData.role, router, userId]);

  if (step === 'done') return null;

  const steps = getOrderedSteps(formData.role);
  const currentIndex = steps.indexOf(step);
  const totalSteps = steps.length;
  const progressPercent = totalSteps > 0 ? ((currentIndex + 1) / totalSteps) * 100 : 0;
  const canGoBack = currentIndex > 0;

  return (
    <div className="relative flex min-h-screen min-w-[90vw] rounded-4xl flex-col items-start justify-center bg-transparent ">
      <div className="w-full -mt-60">
        {/* En-tête */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl font-medium text-gray-500">
              {isFR ? 'Étape' : 'Step'} {currentIndex + 1} {isFR ? 'sur' : 'of'} {totalSteps}
            </span>
            <span className="text-md font-semibold text-blue-600">
              {STEP_LABELS[step]}
            </span>
          </div>

          {/* Barre de progression */}
          <div className="mb-2">
          <div className="h-3 w-full rounded-full bg-gray-200">
            <div
              className="h-3 rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
        
            />
            <div className= " flex justify-between -mt-5">
            {steps.map((s, idx) => (
              <div
                key={s}
                className={`flex h-8 w-8 rounded-full transition-colors ${
                  idx < currentIndex ? 'bg-blue-500' : idx === currentIndex ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          </div>

          {/* Pastilles d'étapes */}
        
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
              ← {isFR ? 'Retour' : 'Back'}
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
          {step === 'faceVerification' && <IdentityVerificationStep onboarding={onboarding} />}
        </div>

      </div>

      {/* Popup abandon conducteur */}
      {showAbandonWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="text-center mb-4">
            </div>
            <h3 className="mb-2 text-center text-lg font-semibold text-gray-900">
              {isFR ? "Abandonner l'inscription conducteur ?" : 'Abandon driver registration?'}
            </h3>
            <p className="mb-6 text-center text-sm text-gray-500">
              {isFR
                ? 'Si vous continuez, vous serez enregistré(e) comme passager uniquement. Vous pourrez proposer des trajets plus tard depuis votre profil.'
                : 'If you continue, you will be registered as a passenger only. You will be able to offer trips later from your profile.'}
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={confirmAbandonDriver}
                className="w-full rounded-lg bg-red-500 px-4 py-3 text-sm font-medium text-white hover:bg-red-600 transition-colors"
              >
                {isFR ? 'Continuer comme passager' : 'Continue as passenger'}
              </button>
              <button
                type="button"
                onClick={cancelAbandonDriver}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {isFR ? 'Rester conducteur' : 'Stay as driver'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
