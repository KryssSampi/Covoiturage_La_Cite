'use client';

import type { useOnboarding } from '../../hooks/useOnboarding';
import { VEHICLE_MAKES, VEHICLE_COLORS, VEHICLE_YEARS, getModelsByMake } from '../../data/vehicles';
import { Language, useAppState } from '@/core/state/app_state';

interface Props {
  onboarding: ReturnType<typeof useOnboarding>;
}

const CAPACITY_OPTIONS = [2, 3, 4, 5, 6, 7, 8];

export default function VehicleInfoStep({ onboarding }: Props) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;
  const { formData, setField, isLoading, error, submitVehicle, triggerAbandonWarning } = onboarding;

  const models = getModelsByMake(formData.vehicleMake);

  const handleMakeChange = (make: string) => {
    setField('vehicleMake', make);
    setField('vehicleModel', '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitVehicle();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {isFR ? 'Informations sur le véhicule' : 'Vehicle Information'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {isFR
            ? 'Ces informations seront visibles par vos passagers.'
            : 'This information will be visible to your passengers.'}
        </p>
      </div>

      {/* Marque */}
      <div>
        <label htmlFor="v-make" className="mb-1 block text-sm font-medium text-gray-700">
          {isFR ? 'Marque' : 'Make'}
        </label>
        <select
          id="v-make"
          value={formData.vehicleMake}
          onChange={(e) => handleMakeChange(e.target.value)}
          disabled={isLoading}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 bg-white
                     focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                     disabled:bg-gray-50"
        >
          <option value="">{isFR ? 'Sélectionnez une marque' : 'Select a make'}</option>
          {VEHICLE_MAKES.map((m) => (
            <option key={m.make} value={m.make}>{m.make}</option>
          ))}
        </select>
      </div>

      {/* Modèle */}
      <div>
        <label htmlFor="v-model" className="mb-1 block text-sm font-medium text-gray-700">
          {isFR ? 'Modèle' : 'Model'}
        </label>
        <select
          id="v-model"
          value={formData.vehicleModel}
          onChange={(e) => setField('vehicleModel', e.target.value)}
          disabled={isLoading || !formData.vehicleMake}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 bg-white
                     focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                     disabled:bg-gray-50"
        >
          <option value="">{isFR ? 'Sélectionnez un modèle' : 'Select a model'}</option>
          {models.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Année et Couleur sur la même ligne */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="v-year" className="mb-1 block text-sm font-medium text-gray-700">
            {isFR ? 'Année' : 'Year'}
          </label>
          <select
            id="v-year"
            value={formData.vehicleYear}
            onChange={(e) => setField('vehicleYear', Number(e.target.value))}
            disabled={isLoading}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 bg-white
                       focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                       disabled:bg-gray-50"
          >
            {VEHICLE_YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="v-color" className="mb-1 block text-sm font-medium text-gray-700">
            {isFR ? 'Couleur' : 'Color'}
          </label>
          <select
            id="v-color"
            value={formData.vehicleColor}
            onChange={(e) => setField('vehicleColor', e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 bg-white
                       focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                       disabled:bg-gray-50"
          >
            <option value="">{isFR ? 'Couleur' : 'Color'}</option>
            {VEHICLE_COLORS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Plaque */}
      <div>
        <label htmlFor="v-plate" className="mb-1 block text-sm font-medium text-gray-700">
          {isFR ? "Plaque d'immatriculation" : 'License Plate'}
        </label>
        <input
          id="v-plate"
          type="text"
          value={formData.vehicleLicensePlate}
          onChange={(e) => setField('vehicleLicensePlate', e.target.value.toUpperCase())}
          placeholder="ABC 123"
          maxLength={10}
          disabled={isLoading}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 uppercase
                     focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                     disabled:bg-gray-50"
        />
      </div>

      {/* Capacité */}
      <div>
        <label htmlFor="v-capacity" className="mb-1 block text-sm font-medium text-gray-700">
          {isFR ? 'Nombre de places passager' : 'Number of passenger seats'}
        </label>
        <select
          id="v-capacity"
          value={formData.vehicleCapacity}
          onChange={(e) => setField('vehicleCapacity', Number(e.target.value))}
          disabled={isLoading}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 bg-white
                     focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                     disabled:bg-gray-50"
        >
          {CAPACITY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c} {isFR ? `place${c > 1 ? 's' : ''}` : `seat${c > 1 ? 's' : ''}`}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isLoading || !formData.vehicleMake || !formData.vehicleModel || !formData.vehicleColor || !formData.vehicleLicensePlate}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white
                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      >
        {isLoading
          ? (isFR ? 'Traitement...' : 'Processing...')
          : (isFR ? 'Continuer' : 'Continue')}
      </button>

      {/* Lien d'abandon */}
      <button
        type="button"
        onClick={triggerAbandonWarning}
        className="text-xs text-gray-400 hover:text-gray-600 underline text-center transition-colors"
      >
        {isFR ? 'Continuer en tant que passager uniquement' : 'Continue as passenger only'}
      </button>
    </form>
  );
}
