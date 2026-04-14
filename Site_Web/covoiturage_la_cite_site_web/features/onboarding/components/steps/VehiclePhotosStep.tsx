'use client';

import { useRef } from 'react';
import type { useOnboarding } from '../../hooks/useOnboarding';
import { Language, useAppState } from '@/core/state/app_state';

interface Props {
  onboarding: ReturnType<typeof useOnboarding>;
}

const MAX_PHOTOS = 6;

export default function VehiclePhotosStep({ onboarding }: Props) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;
  const { formData, setField, isLoading, error, submitVehiclePhotos, triggerAbandonWarning } = onboarding;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const photoUrls = formData.vehiclePhotoUrls;

  // Simulation upload : convertit le fichier en data URL local (à remplacer par upload CDN)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = MAX_PHOTOS - photoUrls.length;
    const toProcess = files.slice(0, remaining);

    toProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setField('vehiclePhotoUrls', [...formData.vehiclePhotoUrls, url]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input pour permettre re-sélection
    if (e.target) e.target.value = '';
  };

  const removePhoto = (index: number) => {
    const updated = photoUrls.filter((_, i) => i !== index);
    setField('vehiclePhotoUrls', updated);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {isFR ? 'Photos du véhicule' : 'Vehicle Photos'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {isFR
            ? "Ajoutez jusqu'à 6 photos de votre véhicule (extérieur / intérieur)."
            : 'Add up to 6 photos of your vehicle (exterior / interior).'}
        </p>
      </div>

      {/* Grille de photos */}
      <div className="grid grid-cols-3 gap-2">
        {photoUrls.map((url, idx) => (
          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(idx)}
              aria-label={isFR ? 'Supprimer la photo' : 'Delete photo'}
              className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold hover:bg-red-600"
            >
              ×
            </button>
          </div>
        ))}

        {/* Slots vides */}
        {photoUrls.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
          >
            <span className="text-2xl">+</span>
            <span className="text-xs">{isFR ? 'Photo' : 'Photo'}</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="text-xs text-gray-400 text-center">
        {photoUrls.length} / {MAX_PHOTOS} {isFR ? 'photos ajoutées' : 'photos added'}
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={submitVehiclePhotos}
        disabled={isLoading || photoUrls.length === 0}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white
                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      >
        {isLoading
          ? (isFR ? 'Traitement...' : 'Processing...')
          : (isFR ? 'Continuer' : 'Continue')}
      </button>

      <button
        type="button"
        onClick={triggerAbandonWarning}
        className="text-xs text-gray-400 hover:text-gray-600 underline text-center transition-colors"
      >
        {isFR ? 'Continuer en tant que passager uniquement' : 'Continue as passenger only'}
      </button>
    </div>
  );
}
