'use client';

import React from 'react';
import { FaLocationDot, FaCalendarDays, FaClock } from 'react-icons/fa6';
import { CreateTripFormState, TripType } from '../../../types';

interface BasicInfoSectionProps {
  form:     CreateTripFormState;
  errors:   Partial<Record<keyof CreateTripFormState, string>>;
  setField: <K extends keyof CreateTripFormState>(key: K, value: CreateTripFormState[K]) => void;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ form, errors, setField }) => {
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
            className="w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition"
            style={{ borderColor: errors.departureLocation ? '#ef4444' : '#d1d5db' }}
          />
        </div>
        {errors.departureLocation && (
          <p className="text-xs text-red-500 mt-1">{errors.departureLocation}</p>
        )}
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
            className="w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition"
            style={{ borderColor: errors.arrivalLocation ? '#ef4444' : '#d1d5db' }}
          />
        </div>
        {errors.arrivalLocation && (
          <p className="text-xs text-red-500 mt-1">{errors.arrivalLocation}</p>
        )}
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
            <input
              type="date"
              value={form.departureDate}
              onChange={(e) => setField('departureDate', e.target.value)}
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
            <input
              type="time"
              value={form.departureTime}
              onChange={(e) => setField('departureTime', e.target.value)}
              className="w-full pl-9 pr-2 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition"
              style={{ borderColor: errors.departureTime ? '#ef4444' : '#d1d5db' }}
            />
          </div>
          {errors.departureTime && (
            <p className="text-xs text-red-500 mt-1">{errors.departureTime}</p>
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
