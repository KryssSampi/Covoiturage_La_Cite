'use client';

import React from 'react';

// Composant TogglePreferenceRow
// Ligne de preference avec interrupteur (toggle) et libelle

interface TogglePreferenceRowProps {
  label:    string;
  icon?:    React.ReactNode;
  checked:  boolean;
  onChange: (value: boolean) => void;
  large?:   boolean;
}

export function TogglePreferenceRow({
  label,
  icon,
  checked,
  onChange,
  large = false,
}: TogglePreferenceRowProps): React.ReactElement {
  // Classes calculees en dehors du JSX pour eviter les erreurs de parsing
  const rowPadding     = large ? 'py-4' : 'py-3';
  const spanSize       = large ? 'text-base' : 'text-sm';
  const trackColor     = checked ? 'bg-emerald-500' : 'bg-gray-300';
  const thumbTranslate = checked ? 'translate-x-5' : 'translate-x-0.5';

  return (
    <label
      className={
        'flex cursor-pointer items-center justify-between rounded-xl ' +
        'border border-gray-200 bg-white px-4 transition hover:bg-gray-50 ' +
        rowPadding
      }
    >
      {/* Icone + libelle */}
      <div className="flex items-center gap-3">
        {icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            {icon}
          </span>
        )}
        <span className={'font-medium text-gray-800 ' + spanSize}>
          {label}
        </span>
      </div>

      {/* Toggle switch */}
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className={'h-6 w-11 rounded-full transition-colors ' + trackColor} />
        <div
          className={
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ' +
            thumbTranslate
          }
        />
      </div>
    </label>
  );
}
