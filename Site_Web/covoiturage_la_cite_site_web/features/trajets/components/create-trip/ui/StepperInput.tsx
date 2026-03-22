'use client';

import React from 'react';

// Composant StepperInput
// Bouton - / valeur / + pour les champs numeriques (prix, places...)

interface StepperInputProps {
  value:       number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?:        number;
  max?:        number;
  suffix?:     string;   // ex: " $", " places"
  valueWidth?: string;   // largeur CSS de la zone de valeur (defaut: "3rem")
  disabled?:   boolean;
}

export function StepperInput({
  value,
  onIncrement,
  onDecrement,
  min,
  max,
  suffix = '',
  valueWidth = '3rem',
  disabled = false,
}: StepperInputProps): React.ReactElement {
  const isAtMin = min !== undefined && value <= min;
  const isAtMax = max !== undefined && value >= max;

  return (
    <div className="flex items-center gap-2">
      {/* Bouton decrementer */}
      <button
        type="button"
        onClick={onDecrement}
        disabled={disabled || isAtMin}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Diminuer"
      >
        <span className="text-lg font-semibold leading-none select-none">-</span>
      </button>

      {/* Affichage de la valeur */}
      <span
        className="text-center text-base font-semibold tabular-nums"
        style={{ minWidth: valueWidth }}
      >
        {value}{suffix}
      </span>

      {/* Bouton incrementer */}
      <button
        type="button"
        onClick={onIncrement}
        disabled={disabled || isAtMax}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Augmenter"
      >
        <span className="text-lg font-semibold leading-none select-none">+</span>
      </button>
    </div>
  );
}
