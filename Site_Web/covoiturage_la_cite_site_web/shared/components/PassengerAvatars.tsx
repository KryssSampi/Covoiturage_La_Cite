"use client";

/**
 * @file PassengerAvatars.tsx
 * @description Composant partagé d'affichage des avatars de passagers.
 *
 * Consolidé depuis 5 copies à travers le projet :
 * - features/dashboard/components/passenger/reservations.section.tsx
 * - features/dashboard/components/passenger/recommended-rides.section.tsx
 * - features/dashboard/components/driver/published_trips.section.tsx
 * - features/search/components/shared/RecommendedTripCard.tsx
 * - features/reservations/components/PassengerReservationsPage.tsx
 *
 * Supporte deux modes :
 * - Contrôlé (isOpen + onToggle + onClose fournis par le parent)
 * - Autonome (gère son propre état d'ouverture via useState interne)
 */

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { Language, useAppState } from "@/core/state/app_state";
import type { Passenger } from "@/features/dashboard/types";

// ─── Types ───────────────────────────────────────────────────────────────────

/** Props en mode contrôlé — l'état d'ouverture est géré par le parent */
interface ControlledProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

/** Props en mode autonome — le composant gère son propre état */
interface UncontrolledProps {
  isOpen?: undefined;
  onToggle?: undefined;
  onClose?: undefined;
}

export interface PassengerAvatarsProps {
  /** Liste des passagers à afficher */
  passengers: Passenger[];
  /** Taille des avatars principaux en pixels (défaut : 40) */
  avatarSize?: number;
  /** Taille des avatars dans la liste déroulante en pixels (défaut : 32) */
  dropdownAvatarSize?: number;
  /** Classes CSS supplémentaires appliquées au conteneur racine */
  className?: string;
  /** Afficher une bordure colorée autour des avatars */
  withBorder?: boolean;
  /** URL de l'image placeholder en cas de pictureUrl manquante */
  fallbackSrc?: string;
}

export type PassengerAvatarsCombinedProps = PassengerAvatarsProps & (ControlledProps | UncontrolledProps);

// ─── Composant ───────────────────────────────────────────────────────────────

/**
 * Affiche les avatars des passagers d'un trajet avec liste déroulante.
 *
 * - 1 passager : avatar + nom cliquable vers le profil public.
 * - 2 passagers : deux avatars cliquables.
 * - 3+ passagers : deux avatars + « +N autres » cliquable avec liste déroulante.
 *
 * La liste déroulante se ferme au survol sortant (onMouseLeave).
 */
export function PassengerAvatars({
  passengers,
  avatarSize = 40,
  dropdownAvatarSize = 32,
  className = "",
  withBorder = false,
  fallbackSrc,
  ...openProps
}: PassengerAvatarsCombinedProps) {
  const { lang } = useAppState();

  // Mode autonome : état interne si aucun contrôle externe fourni
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = openProps.isOpen !== undefined;
  const isOpen   = isControlled ? openProps.isOpen : internalOpen;
  const onToggle = isControlled
    ? openProps.onToggle
    : (e?: React.MouseEvent) => { e?.stopPropagation(); setInternalOpen((v) => !v); };
  const onClose  = isControlled ? openProps.onClose : () => setInternalOpen(false);

  const borderClass = withBorder ? "border-2 border-[#08316e]" : "";
  const getSrc = (p: Passenger) => p.pictureUrl || fallbackSrc || "/assets/placeholder/placeholer-profile-picture.png";

  return (
    <div className={`relative flex items-center gap-2 ${passengers.length === 1 ? "bg-white px-2 rounded-full" : ""} ${className}`}>
      {/* Avatars des 2 premiers passagers */}
      {passengers.slice(0, 2).map((p) => (
        <Link key={p.id} href={`/public-profile?accountid=${p.id}`}>
          <Image
            src={getSrc(p)}
            alt={p.name}
            className={`rounded-full object-cover ${borderClass}`}
            style={{ width: avatarSize, height: avatarSize }}
            width={avatarSize}
            height={avatarSize}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/assets/placeholder/placeholer-profile-picture.png"; }}
          />
        </Link>
      ))}

      {/* Nom affiché si un seul passager */}
      {passengers.length === 1 && (
        <Link
          href={`/public-profile?accountid=${passengers[0].id}`}
          className="text-sm text-gray-700 hover:text-blue-500 hover:underline"
        >
          {passengers[0].name}
        </Link>
      )}

      {/* Indicateur « +N autres » pour plus de 2 passagers */}
      {passengers.length > 2 && (
        <span
          className="text-sm text-gray-700 hover:text-blue-400 hover:underline cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            if (typeof onToggle === "function") {
              // Gérer le cas contrôlé (pas d'argument) vs autonome (avec event)
              (onToggle as () => void)();
            }
          }}
        >
          +{passengers.length - 2} {lang === Language.FR ? "autres" : "more"}
        </span>
      )}

      {/* Liste déroulante de tous les passagers */}
      {passengers.length > 2 && isOpen && (
        <div
          className="absolute left-0 bottom-10 z-10 flex flex-col rounded-lg bg-white shadow-lg p-2 gap-1"
          onMouseLeave={onClose}
        >
          {passengers.map((p) => (
            <Link
              key={p.id}
              href={`/public-profile?accountid=${p.id}`}
              className="flex items-center gap-2"
            >
              <Image
                src={getSrc(p)}
                alt={p.name}
                className={`rounded-full object-cover ${borderClass}`}
                style={{ width: dropdownAvatarSize, height: dropdownAvatarSize }}
                width={dropdownAvatarSize}
                height={dropdownAvatarSize}
              />
              <span className="text-sm text-gray-700 hover:text-blue-500 hover:underline">
                {p.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
