'use client';
// ══════════════════════════════════════════════════════════════════════
// TripHeaderCard — Carte résumé du trajet partagée entre features
// Affiche conducteur, véhicule, prix, et actions en style Tailwind.
// Enrichissable avec badges, statut, ID de trajet, etc.
// ══════════════════════════════════════════════════════════════════════
import React, { type ReactNode, useState } from 'react';
import Image from 'next/image';
import { FaUser, FaCalendarDays, FaStar } from 'react-icons/fa6';
import { FaCheck } from 'react-icons/fa';
import { FaCircleCheck } from 'react-icons/fa6';

const VEHICLE_PLACEHOLDER = '/assets/placeholder/no-car-image.jpg';

// ── Types ────────────────────────────────────────────────────────────

export interface TripHeaderDriver {
  firstName: string;
  lastName?: string;
  avatarUrl?: string;
  /** Initiales affichées si aucune photo n'est fournie */
  initials?: string;
  rating: number;
  tripCount: number;
  isVerified?: boolean;
  badges?: Array<{ id: string; icon: ReactNode; label: string }>;
}

export interface TripHeaderVehicle {
  label: string;
  color: string;
  imageUrl?: string;
  /** Plaque d'immatriculation */
  plate?: string;
}

export interface TripHeaderStatus {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  pulse?: boolean;
}

export interface TripHeaderCardProps {
  /** Titre affiché en haut (ex: "Ottawa → Toronto") */
  title: string;
  /** Identifiant du trajet (ex: "TRJ-2026-08842") */
  tripId?: string;
  /** Label du rôle (ex: "Vue conducteur") */
  roleLabel?: string;
  /** Badge de statut (ex: "En cours…") */
  statusBadge?: TripHeaderStatus;
  /** Informations du conducteur */
  driver: TripHeaderDriver;
  /** Informations du véhicule */
  vehicle: TripHeaderVehicle;
  /** Prix par passager */
  price: number;
  /** Date de départ (format affiché) */
  departureDate?: string;
  /** Heure de départ */
  departureTime?: string;
  /** Places disponibles */
  availableSeats: number;
  /** Boutons d'action (slot) */
  actions?: ReactNode;
  /** Classes CSS additionnelles pour le conteneur */
  className?: string;
}

// ── Composant étoiles ────────────────────────────────────────────────
const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <span className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <FaStar
        key={i}
        size={10}
        color={i <= Math.round(rating) ? '#f59e0b' : '#d1d5db'}
      />
    ))}
  </span>
);

// ══════════════════════════════════════════════════════════════════════
export const TripHeaderCard: React.FC<TripHeaderCardProps> = ({
  title,
  tripId,
  roleLabel,
  statusBadge,
  driver,
  vehicle,
  price,
  departureDate,
  departureTime,
  availableSeats,
  actions,
  className = '',
}) => {
  // Image véhicule avec fallback vers le placeholder
  const [vehicleImgSrc, setVehicleImgSrc] = useState(
    vehicle.imageUrl || VEHICLE_PLACEHOLDER,
  );

  // La section conducteur utilise un margin-bottom réduit quand des badges sont affichés
  const hasBadges = driver.badges && driver.badges.length > 0;

  return (
    <div className={`bg-white rounded-2xl shadow-xl p-6 ${className}`}>

      {/* ── Ligne titre + statut ── */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1 min-w-0 pr-2">
          <h1
            className="text-lg font-bold leading-snug truncate"
            style={{ color: '#08316e' }}
            title={title}
          >
            {title}
          </h1>
          {/* ID + rôle — affiché seulement si fourni */}
          {(tripId || roleLabel) && (
            <p className="text-sm text-gray-400 mt-0.5">
              {tripId && <span>#{tripId}</span>}
              {tripId && roleLabel && ' · '}
              {roleLabel}
            </p>
          )}
        </div>
        {statusBadge ? (
          <div
            className="flex items-center gap-1.5 text-sm font-bold px-4 py-1.5 rounded-full shrink-0"
            style={{
              background: statusBadge.bgColor,
              border: `1px solid ${statusBadge.borderColor}`,
              color: statusBadge.color,
            }}
          >
            {statusBadge.pulse && (
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ background: statusBadge.color, animation: 'pulse 1.5s infinite' }}
              />
            )}
            {statusBadge.label}
          </div>
        ) : (
          <button className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 shrink-0">
            ⋮
          </button>
        )}
      </div>

      {/* ── Informations conducteur ── */}
      <div className={`flex items-center gap-4 ${hasBadges ? 'mb-4' : '-mb-15'}`}>
        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            className="w-20 h-20 rounded-full overflow-hidden border-2"
            style={{ borderColor: '#08316e' }}
          >
            {driver.avatarUrl ? (
              <Image
                src={driver.avatarUrl}
                alt={driver.firstName}
                width={80}
                height={80}
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/assets/placeholder/placeholer-profile-picture.png"; }}
              />
            ) : driver.initials ? (
              <div
                className="w-full h-full flex items-center justify-center font-extrabold text-white text-base"
                style={{ background: 'linear-gradient(135deg,#4a90d9,#a8d8f0)' }}
              >
                {driver.initials}
              </div>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                <FaUser size={22} color="#9ca3af" />
              </div>
            )}
          </div>
          {/* Badge vérifié sur l'avatar */}
          {driver.isVerified && (
            <div
              className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center text-white"
              style={{ background: '#0aad6a', border: '2px solid #fff' }}
            >
              <FaCheck size={7} />
            </div>
          )}
        </div>

        {/* Nom + note + badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-base font-semibold text-gray-900 truncate">
              {driver.firstName}{driver.lastName ? ` ${driver.lastName}` : ''}
            </p>
            {driver.isVerified && (
              <span className="inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded bg-green-50 text-green-600 border border-green-200 shrink-0">
                <FaCircleCheck size={9} /> VÉRIFIÉ
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
            <StarRating rating={driver.rating} />
            <span className="font-medium" style={{ color: '#08316e' }}>
              {driver.rating}
            </span>
            <span className="text-gray-400">{driver.tripCount} trajets</span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            {availableSeats} place{availableSeats > 1 ? 's' : ''} disponible{availableSeats > 1 ? 's' : ''}
          </p>
          {/* Badges conducteur — affiché seulement si fourni */}
          {hasBadges && (
            <div className="flex items-center gap-1.5 mt-2">
              {driver.badges!.slice(0, 3).map((b) => (
                <div
                  key={b.id}
                  title={b.label}
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(8,49,110,0.06)', border: '1px solid rgba(8,49,110,0.12)' }}
                >
                  {b.icon}
                </div>
              ))}
              {driver.badges!.length > 3 && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500"
                  style={{ background: 'rgba(8,49,110,0.06)', border: '1px solid rgba(8,49,110,0.12)' }}
                >
                  +{driver.badges!.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Prix + véhicule ── */}
      <div className="flex  items-end justify-between -mt-25 mb-5">
        <div>
          {(departureDate || departureTime) && (
            <p className="text-sm flex  items-baseline  gap-x-3 text-gray-500 mt-1">
              <FaCalendarDays size={16} color="#08316e" />
              {departureDate}{departureDate && departureTime && ', '}{departureTime}
              <span>
                <span className="font-black"> En </span> {vehicle.label}, {vehicle.color}
              </span>
           <span className="text-3xl font-extrabold ml-10" style={{ color: '#08316e' }}>
            +{price} $
          </span>
            </p>
          )}
          {!departureDate && !departureTime && (
            <p className="text-sm flex gap-x-3 text-gray-500 mt-0.5">
              <span>
                <span className="font-black">En </span> {vehicle.label}, {vehicle.color}
              </span>
            </p>
          )}
        </div>
  
        {/* Photo du véhicule — fallback vers le placeholder */}
        <div className=" flex flex-col items-center justify-center gap-1">
        <div className="w-55 h-35 rounded-xl overflow-hidden bg-gray-100 shrink-0">
          <Image
            src={vehicleImgSrc}
            alt={vehicle.label}
            width={150}
            height={100}
            className="w-full h-full object-cover"
            onError={() => setVehicleImgSrc(VEHICLE_PLACEHOLDER)}
          />
        </div>
         {/* Plaque d'immatriculation — affichée seulement si fournie */}
          {vehicle.plate && (
            <div className="flex w-full text-center items-center justify-center mt-1.5 px-2 py-0.5 rounded text-xl font-mono tracking-widest text-white bg-black/70 border border-gray-200">
              {vehicle.plate.toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* ── Actions (slot) ── */}
      {actions && (
        <div className="flex gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};
