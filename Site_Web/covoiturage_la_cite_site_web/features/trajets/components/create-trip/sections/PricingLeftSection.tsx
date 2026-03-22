'use client';

import React from 'react';
import { FaSuitcase, FaPaw, FaBan, FaMusic, FaMapLocationDot } from 'react-icons/fa6';
import { CreateTripFormState, TripPreferences } from '../../../types';
import { TogglePreferenceRow } from '../ui';

interface PricingLeftSectionProps {
  form:          CreateTripFormState;
  setField:      <K extends keyof CreateTripFormState>(key: K, value: CreateTripFormState[K]) => void;
  setPreference: (key: keyof TripPreferences, value: boolean) => void;
}

// Preferences passager avec icones React (couleur marque #08316e)
const PREFERENCES = [
  { key: 'baggageAllowed' as const, label: 'Bagages autorises',  icon: <FaSuitcase size={14} color="#08316e" /> },
  { key: 'petsAllowed'    as const, label: 'Animaux acceptes',    icon: <FaPaw      size={14} color="#08316e" /> },
  { key: 'smokingAllowed' as const, label: 'Non-fumeur',          icon: <FaBan      size={14} color="#08316e" /> },
  { key: 'musicAllowed'   as const, label: 'Musique autorisee',   icon: <FaMusic    size={14} color="#08316e" /> },
];

export const PricingLeftSection: React.FC<PricingLeftSectionProps> = ({
  form,
  setPreference,
}) => {
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
    </div>
  );
};
