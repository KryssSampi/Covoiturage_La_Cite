'use client';

import React from 'react';
import { CreateTripFormState, PaymentMethod } from '../../../types';
import { MIN_PRICE, MAX_PRICE } from '../../../constants/trip.constants';

interface PricingRightSectionProps {
  form: CreateTripFormState;
  incrementPrice: () => void;
  decrementPrice: () => void;
  setField: <K extends keyof CreateTripFormState>(key: K, value: CreateTripFormState[K]) => void;
}

// Options de mode de paiement
const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash',    label: 'Argent Comptant'  },
  { value: 'interac', label: 'Virement Interac' },
];

export const PricingRightSection: React.FC<PricingRightSectionProps> = ({
  form,
  incrementPrice,
  decrementPrice,
  setField,
}) => {
  const canDecrement = form.pricePerPassenger > MIN_PRICE;
  const canIncrement = form.pricePerPassenger < MAX_PRICE;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h2 className="text-base font-bold mb-4" style={{ color: '#08316e' }}>
        Tarification et Paiement
      </h2>

      {/* Controle du prix avec suffixe CAD */}
      <div className="flex items-center gap-1 mb-4">
        <button
          type="button"
          onClick={decrementPrice}
          disabled={!canDecrement}
          className="w-8 h-8 rounded border flex items-center justify-center text-lg font-semibold hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          style={{ color: '#08316e', borderColor: '#08316e' }}
          aria-label="Diminuer le prix"
        >
          {'-'}
        </button>

        <div
          className="flex-1 h-8 flex items-center border rounded px-3 text-sm font-medium"
          style={{ borderColor: '#08316e' }}
        >
          <span className="flex-1 text-right" style={{ color: '#08316e' }}>
            {form.pricePerPassenger}
          </span>
          <span className="ml-2 text-gray-500 text-xs">CAD</span>
        </div>

        <button
          type="button"
          onClick={incrementPrice}
          disabled={!canIncrement}
          className="w-8 h-8 rounded border flex items-center justify-center text-lg font-semibold hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          style={{ color: '#08316e', borderColor: '#08316e' }}
          aria-label="Augmenter le prix"
        >
          {'+'}
        </button>
      </div>

      {/* Mode de paiement */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mode de paiement
        </label>
        <div className="flex flex-col gap-2">
          {PAYMENT_OPTIONS.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="paymentMethodRight"
                value={value}
                checked={form.paymentMethod === value}
                onChange={() => setField('paymentMethod', value)}
                className="w-4 h-4 cursor-pointer"
                style={{ accentColor: '#08316e' }}
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
