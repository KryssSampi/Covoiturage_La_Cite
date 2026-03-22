'use client';

import React from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TripStatusInfo } from '../../../types/published-trip.view.types';
import { PaymentMethod }  from '../../../types/trip.create.types';

interface TripStatusSectionProps {
  status: TripStatusInfo;
  paymentMethod: PaymentMethod;
  availableSeats: number;
  totalSeats: number;
}

export const TripStatusSection: React.FC<TripStatusSectionProps> = ({
  status,
  paymentMethod,
  availableSeats,
  totalSeats,
}) => {
  // Formate la date de derniere mise a jour en texte lisible
  const lastUpdated = (() => {
    try {
      const d = parseISO(status.lastUpdatedAt);
      return format(d, "d MMM 'à' HH'h'mm", { locale: fr });
    } catch {
      return 'N/A';
    }
  })();

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <h3 className="text-sm font-bold mb-3" style={{ color: '#08316e' }}>
        Statut du trajet
      </h3>

      <div className="flex flex-col gap-1.5">
        <StatusRow
          label="Type de départ"
          value={status.tripType === 'unique' ? 'Unique' : 'Récurrent'}
        />
        <StatusRow
          label="Récurrent"
          value={status.isRecurrent ? 'Oui' : 'Non'}
        />
        {status.maxDetourMinutes !== undefined && (
          <StatusRow
            label="Détour max"
            value={`${status.maxDetourMinutes} min`}
          />
        )}
        <StatusRow
          label="Paiement"
          value={paymentMethod === 'cash' ? 'Argent comptant' : 'Virement Interac'}
        />
        <StatusRow
          label="Places"
          value={`${availableSeats} / ${totalSeats} disponible${availableSeats > 1 ? 's' : ''}`}
        />
        <StatusRow
          label="Dernière MAJ"
          value={lastUpdated}
        />
      </div>
    </div>
  );
};

// Ligne de statut avec label et valeur
const StatusRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center gap-2 text-xs">
    <span className="text-gray-500 w-28 shrink-0">{label} :</span>
    <span className="font-medium text-gray-800">{value}</span>
  </div>
);
