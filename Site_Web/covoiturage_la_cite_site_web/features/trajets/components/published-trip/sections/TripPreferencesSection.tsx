'use client';

import React from 'react';
import { FaCircleCheck, FaBan } from 'react-icons/fa6';
import { TripPreferencesView } from '../../../types/published-trip.view.types';

interface TripPreferencesSectionProps {
  preferences: TripPreferencesView;
}

// Clés des préférences booléennes (hors note conducteur)
type PreferenceKey = 'baggageAllowed' | 'petsAllowed' | 'smokingAllowed' | 'musicAllowed' | 'flexibleItinerary';

interface PreferenceItem {
  key: PreferenceKey;
  labelTrue: string;
  labelFalse: string;
}

// Tableau des options affichees dans la section preferences
const PREFERENCE_ITEMS: PreferenceItem[] = [
  { key: 'baggageAllowed', labelTrue: 'Bagages autorisés', labelFalse: 'Pas de bagages' },
  { key: 'petsAllowed', labelTrue: 'Animaux acceptés', labelFalse: 'Zone sans animaux' },
  { key: 'smokingAllowed', labelTrue: 'Fumeur accepté', labelFalse: 'Non-fumeur' },
  { key: 'musicAllowed', labelTrue: 'Musique autorisée', labelFalse: 'Zone sans musique' },
];

export const TripPreferencesSection: React.FC<TripPreferencesSectionProps> = ({
  preferences,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <h3 className="text-sm font-bold mb-3" style={{ color: '#08316e' }}>
        Préférences et services
      </h3>

      {/* Grille 2 colonnes */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {PREFERENCE_ITEMS.map(({ key, labelTrue, labelFalse }) => {
          const isAllowed = preferences[key] as boolean;
          return (
            <div key={key} className="flex items-center gap-1.5">
              {isAllowed
                ? <FaCircleCheck size={14} color="#16a34a" />
                : <FaBan size={14} color="#e04a2f" />}
              <span className="text-xs text-gray-700">
                {isAllowed ? labelTrue : labelFalse}
              </span>
            </div>
          );
        })}
      </div>

      {/* Message du conducteur aux passagers */}
      {preferences.driverNote && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            <span className="font-medium text-gray-700">Message aux passagers : </span>
            {preferences.driverNote}
          </p>
        </div>
      )}
    </div>
  );
};
