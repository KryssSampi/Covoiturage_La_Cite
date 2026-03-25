'use client';

import React from 'react';
import { CreateTripFormState } from '../../../types';
import type { MockVehicle } from '../../../constants/trip.constants';
import { StepperInput } from '../ui';

interface VehicleSectionProps {
  form:                    CreateTripFormState;
  errors:                  Partial<Record<keyof CreateTripFormState, string>>;
  /** Véhicules réels du conducteur, fournis par la page via l'API */
  vehicles:                MockVehicle[];
  onVehicleChange:         (vehicleId: string) => void;
  incrementAvailableSeats: () => void;
  decrementAvailableSeats: () => void;
}

export const VehicleSection: React.FC<VehicleSectionProps> = ({
  form,
  errors,
  vehicles,
  onVehicleChange,
  incrementAvailableSeats,
  decrementAvailableSeats,
}) => {
  const selectedVehicle = vehicles.find((v) => v.id === form.vehicleId) ?? vehicles[0] ?? null;
  const singleVehicle   = vehicles.length === 1 ? vehicles[0] : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h2 className="text-base font-bold mb-4" style={{ color: '#08316e' }}>
        Details du Vehicule et Places
      </h2>

      {/* Selection vehicule */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicule</label>
        <div className="relative">
          {singleVehicle ? (
            /* Un seul véhicule → champ désactivé affichant son nom */
            <input
              type="text"
              readOnly
              disabled
              value={`${singleVehicle.label}${singleVehicle.color ? ` — ${singleVehicle.color}` : ''}`}
              className="w-full px-3 py-2.5 border rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              style={{ borderColor: '#d1d5db' }}
            />
          ) : (
            <select
              value={form.vehicleId}
              onChange={(e) => onVehicleChange(e.target.value)}
              className="w-full px-3 py-2.5 border rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 transition pr-8 cursor-pointer"
              style={{ borderColor: errors.vehicleId ? '#ef4444' : '#d1d5db' }}
            >
              <option value="" disabled>
                {vehicles.length === 0 ? 'Aucun vehicule enregistre' : 'Selectionner un vehicule...'}
              </option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}{v.color ? ` — ${v.color}` : ''}
                </option>
              ))}
            </select>
          )}
          {!singleVehicle && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              ▾
            </span>
          )}
        </div>
        {errors.vehicleId && (
          <p className="text-xs text-red-500 mt-1">{errors.vehicleId}</p>
        )}
      </div>

      {/* Nombre de places totales (issu du vehicule) */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de places totales
          <span className="text-xs text-gray-400 ml-2">(issu du vehicule)</span>
        </label>
        <p className="text-lg font-semibold" style={{ color: '#08316e' }}>
          {selectedVehicle ? selectedVehicle.maxPassengers : form.maxPassengers}
        </p>
      </div>

      {/* Nombre de places disponibles */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre de places disponibles
        </label>
        <StepperInput
          value={form.availableSeats}
          onIncrement={incrementAvailableSeats}
          onDecrement={decrementAvailableSeats}
          min={1}
          max={(selectedVehicle?.maxPassengers ?? form.maxPassengers) - 1}
        />
        <p className="text-xs text-gray-400 mt-1">
          default : <span className="font-medium">places totales - 1</span>
        </p>
      </div>
    </div>
  );
};
