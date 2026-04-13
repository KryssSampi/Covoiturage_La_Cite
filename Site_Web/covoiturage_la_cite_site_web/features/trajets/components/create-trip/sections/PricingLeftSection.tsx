'use client';

import React, { useState } from 'react';
import { FaSuitcase, FaPaw, FaBan, FaMusic, FaMapLocationDot } from 'react-icons/fa6';
import { CreateTripFormState, TripPreferences } from '../../../types';
import { TogglePreferenceRow } from '../ui';

interface PricingLeftSectionProps {
  form:          CreateTripFormState;
  setField:      <K extends keyof CreateTripFormState>(key: K, value: CreateTripFormState[K]) => void;
  setPreference: <K extends keyof TripPreferences>(key: K, value: TripPreferences[K]) => void;
}

// Preferences passager avec icones React (couleur marque #08316e)
const PREFERENCES = [
  { key: 'baggageAllowed' as const, label: 'Bagages autorises',  icon: <FaSuitcase size={14} color="#08316e" /> },
  { key: 'petsAllowed'    as const, label: 'Animaux acceptes',    icon: <FaPaw      size={14} color="#08316e" /> },
  { key: 'smokingAllowed' as const, label: 'Fumeur',          icon: <FaBan      size={14} color="#08316e" /> },
  { key: 'musicAllowed'   as const, label: 'Musique autorisee',   icon: <FaMusic    size={14} color="#08316e" /> },
];

export const PricingLeftSection: React.FC<PricingLeftSectionProps> = ({
  form,
  setPreference,
}) => {
  const [isDriverNoteEditing, setIsDriverNoteEditing] = useState(
    !form.preferences.driverNote
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h2 className="text-base font-bold mb-4" style={{ color: '#08316e' }}>
        Preferences Passager
      </h2>

      {/* Preferences passager */}
      <div className="flex flex-col gap-0.5">
        {PREFERENCES.map(({ key, label, icon }) => (
          <TogglePreferenceRow
            key={key}
            label={label}
            icon={icon}
            checked={form.preferences[key]}
            onChange={(val) => setPreference(key, val)}
          />
        ))}
      </div>

      {/* Itineraire flexible - grand toggle */}
      <div className="mt-2">
        <TogglePreferenceRow
          label='Itineraire Flexible'
          icon={<FaMapLocationDot size={14} color="#08316e" />}
          checked={form.preferences.flexibleItinerary}
          onChange={(val) => setPreference('flexibleItinerary', val)}
          large
        />
        <p className="text-xs text-gray-400 mt-1">
          default : <span className="font-medium">toutes les preferences desactivees</span>
        </p>
      </div>

      {/* Instruction conducteur */}
      <div className="mt-4 border border-gray-200 rounded-xl p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold" style={{ color: '#08316e' }}>
            Instruction conducteur
          </h3>
          <button
            type="button"
            onClick={() => setIsDriverNoteEditing((prev) => !prev)}
            className="text-xs font-semibold text-[#08316e] hover:underline"
          >
            {isDriverNoteEditing ? 'Confirmer' : 'Modifier'}
          </button>
        </div>

        {isDriverNoteEditing ? (
          <textarea
            value={form.preferences.driverNote ?? ''}
            onChange={(e) => setPreference('driverNote', e.target.value)}
            placeholder="Ex : Je vous attends 5 minutes, contactez-moi si retard."
            rows={3}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition"
            style={{ borderColor: '#d1d5db' }}
          />
        ) : (
          <p className="text-xs text-gray-600">
            {form.preferences.driverNote
              ? form.preferences.driverNote
              : 'Aucune instruction pour le moment.'}
          </p>
        )}
      </div>
    </div>
  );
};
