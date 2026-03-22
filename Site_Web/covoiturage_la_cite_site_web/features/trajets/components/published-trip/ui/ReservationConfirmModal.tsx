'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { FaUser, FaStar, FaCalendarDays, FaLocationDot, FaDollarSign, FaCreditCard } from 'react-icons/fa6';
import { PublishedTripViewData } from '../../../types/published-trip.view.types';

interface ReservationConfirmModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  trip: PublishedTripViewData;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ReservationConfirmModal: React.FC<ReservationConfirmModalProps> = ({
  isOpen,
  isSubmitting,
  trip,
  onConfirm,
  onCancel,
}) => {
  // Fermeture avec la touche Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <h3 className="text-base font-bold" style={{ color: '#08316e' }}>
            Confirmer la réservation
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {trip.departure.label} → {trip.arrival.label}
          </p>
        </div>

        {/* Résumé du trajet */}
        <div className="px-5 py-4 flex flex-col gap-2.5">
          {/* Conducteur */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0 border-2"
              style={{ borderColor: '#08316e' }}
            >
              {trip.driver.avatarUrl ? (
                <Image
                  src={trip.driver.avatarUrl}
                  alt=""
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/assets/placeholder/placeholer-profile-picture.png"; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <FaUser size={18} color="#9ca3af" />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{trip.driver.firstName}</p>
              <p className="text-xs text-gray-400">
                <FaStar size={10} color="#f59e0b" style={{ display: 'inline', marginRight: 2 }} /> {trip.driver.rating} · {trip.driver.tripCount} trajets
              </p>
            </div>
          </div>

          {/* Détails du trajet */}
          <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-1.5">
            <Row icon={<FaCalendarDays size={11} color="#08316e" />} label="Départ" value={`${trip.departureDate} à ${trip.departureTime}`} />
            <Row icon={<FaLocationDot size={11} color="#08316e" />} label="De" value={trip.departure.label} />
            <Row icon={<FaLocationDot size={11} color="#08316e" />} label="À" value={trip.arrival.label} />
            <Row icon={<FaDollarSign size={11} color="#08316e" />} label="Prix" value={`+${trip.pricePerPassenger} $`} />
            <Row
              icon={<FaCreditCard size={11} color="#08316e" />}
              label="Paiement"
              value={trip.paymentMethod === 'cash' ? 'Argent comptant' : 'Virement Interac'}
            />
          </div>

          <p className="text-xs text-gray-400 text-center">
            Votre demande sera envoyée au conducteur pour approbation.
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60"
            style={{ backgroundColor: '#08316e' }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Envoi…
              </span>
            ) : (
              'Confirmer'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Ligne de résumé avec icône React, label, valeur
const Row: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 text-xs">
    <span className="flex items-center">{icon}</span>
    <span className="text-gray-500 w-14 shrink-0">{label}</span>
    <span className="font-medium text-gray-800 truncate">{value}</span>
  </div>
);
