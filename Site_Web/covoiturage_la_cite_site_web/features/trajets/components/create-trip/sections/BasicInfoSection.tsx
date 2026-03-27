'use client';

import React, { useState } from 'react';
import { FaLocationDot, FaCalendarDays, FaClock } from 'react-icons/fa6';
import { CreateTripFormState, TripType } from '../../../types';

interface BasicInfoSectionProps {
  form:     CreateTripFormState;
  errors:   Partial<Record<keyof CreateTripFormState, string>>;
  setField: <K extends keyof CreateTripFormState>(key: K, value: CreateTripFormState[K]) => void;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ form, errors, setField }) => {
  const [showDepartureInstruction, setShowDepartureInstruction] = useState(
    Boolean(form.departureInstructions)
  );
  const [showArrivalInstruction, setShowArrivalInstruction] = useState(
    Boolean(form.arrivalInstructions)
  );

  // Récupère la date du jour au format YYYY-MM-DD pour bloquer les dates passées
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  // Validation UX pour l'heure de départ
  let customTimeError = '';
  if (form.departureDate === todayStr && form.departureTime) {
    // On construit la date complète à partir de la date et l'heure sélectionnées
    const [h, m] = form.departureTime.split(':');
    const selected = new Date(yyyy, today.getMonth(), today.getDate(), Number(h), Number(m));
    const now = new Date();
    const diffMs = selected.getTime() - now.getTime();
    if (diffMs < 0) {
      // L'heure sélectionnée est dans le passé
      customTimeError = "Vous ne pouvez pas sélectionner une heure antérieure à l'heure actuelle.";
    } else if (diffMs < 30 * 60 * 1000) {
      // L'heure sélectionnée est trop proche
      customTimeError = "Veuillez sélectionner une heure au moins 30 minutes après l'heure actuelle.";
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h2 className="text-base font-bold mb-4" style={{ color: '#08316e' }}>
        Informations de Base sur le Trajet
      </h2>

      {/* Lieu de depart */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Lieu de depart
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center" style={{ color: '#08316e' }}>
            <FaLocationDot size={14} color="#08316e" />
          </span>
          <input
            type="text"
            value={form.departureLocation}
            onChange={(e) => setField('departureLocation', e.target.value)}
            placeholder="Campus La Cite, Ottawa"
            className="w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition bg-gray-100 cursor-not-allowed"
            style={{ borderColor: errors.departureLocation ? '#ef4444' : '#d1d5db' }}
            disabled
            readOnly
          />
        </div>
        {errors.departureLocation && (
          <p className="text-xs text-red-500 mt-1">{errors.departureLocation}</p>
        )}
        <div className="mt-2">
          {!showDepartureInstruction && (
            <button
              type="button"
              onClick={() => setShowDepartureInstruction(true)}
              className="text-xs font-semibold text-[#08316e] hover:underline"
            >
              + Ajouter une instruction pour la zone de depart
            </button>
          )}
          {showDepartureInstruction && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-600">Instruction depart</span>
                <button
                  type="button"
                  onClick={() => {
                    setField('departureInstructions', '');
                    setShowDepartureInstruction(false);
                  }}
                  className="text-xs font-bold text-gray-400 hover:text-gray-600"
                  aria-label="Supprimer l'instruction depart"
                >
                  ×
                </button>
              </div>
              <textarea
                value={form.departureInstructions ?? ''}
                onChange={(e) => setField('departureInstructions', e.target.value)}
                placeholder="Ex : Rendez-vous devant l'entree principale"
                rows={2}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition"
                style={{ borderColor: '#d1d5db' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Lieu d'arrivee */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {"Lieu d'arrivee"}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
            <FaLocationDot size={14} color="#08316e" />
          </span>
          <input
            type="text"
            value={form.arrivalLocation}
            onChange={(e) => setField('arrivalLocation', e.target.value)}
            placeholder="Place d'Orleans"
            className="w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition bg-gray-100 cursor-not-allowed"
            style={{ borderColor: errors.arrivalLocation ? '#ef4444' : '#d1d5db' }}
            disabled
            readOnly
          />
        </div>
        {errors.arrivalLocation && (
          <p className="text-xs text-red-500 mt-1">{errors.arrivalLocation}</p>
        )}
        <div className="mt-2">
          {!showArrivalInstruction && (
            <button
              type="button"
              onClick={() => setShowArrivalInstruction(true)}
              className="text-xs font-semibold text-[#08316e] hover:underline"
            >
              + Ajouter une instruction pour la zone d'arrivee
            </button>
          )}
          {showArrivalInstruction && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-600">Instruction arrivee</span>
                <button
                  type="button"
                  onClick={() => {
                    setField('arrivalInstructions', '');
                    setShowArrivalInstruction(false);
                  }}
                  className="text-xs font-bold text-gray-400 hover:text-gray-600"
                  aria-label="Supprimer l'instruction arrivee"
                >
                  ×
                </button>
              </div>
              <textarea
                value={form.arrivalInstructions ?? ''}
                onChange={(e) => setField('arrivalInstructions', e.target.value)}
                placeholder="Ex : Depose devant la porte laterale"
                rows={2}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition"
                style={{ borderColor: '#d1d5db' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Date + Heure */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date de depart
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
              <FaCalendarDays size={13} color="#6b7280" />
            </span>
            {/* Champ date avec blocage des dates passées */}
            <input
              type="date"
              value={form.departureDate}
              onChange={(e) => setField('departureDate', e.target.value)}
              min={todayStr}
              className="w-full pl-9 pr-2 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition"
              style={{ borderColor: errors.departureDate ? '#ef4444' : '#d1d5db' }}
            />
          </div>
          {errors.departureDate && (
            <p className="text-xs text-red-500 mt-1">{errors.departureDate}</p>
          )}
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Heure de depart
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
              <FaClock size={13} color="#6b7280" />
            </span>
            {/* Champ heure avec validation UX */}
            <input
              type="time"
              value={form.departureTime}
              onChange={(e) => setField('departureTime', e.target.value)}
              className="w-full pl-9 pr-2 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition"
              style={{ borderColor: errors.departureTime || customTimeError ? '#ef4444' : '#d1d5db' }}
            />
          </div>
          {/* Affichage des erreurs natives et personnalisées pour l'heure */}
          {errors.departureTime && (
            <p className="text-xs text-red-500 mt-1">{errors.departureTime}</p>
          )}
          {customTimeError && !errors.departureTime && (
            <p className="text-xs text-red-500 mt-1">{customTimeError}</p>
          )}
        </div>
      </div>

      {/* Type de trajet */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type de trajet
        </label>
        <div className="flex items-center gap-6">
          {(['unique', 'recurrent'] as TripType[]).map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tripType"
                value={type}
                checked={form.tripType === type}
                onChange={() => setField('tripType', type)}
                className="w-4 h-4 cursor-pointer"
                style={{ accentColor: '#08316e' }}
              />
              <span className="text-sm text-gray-700 capitalize">
                {type === 'unique' ? 'Unique' : 'Recurrent'}
              </span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">default : <span className="font-medium">Unique</span></p>
      </div>
    </div>
  );
};
