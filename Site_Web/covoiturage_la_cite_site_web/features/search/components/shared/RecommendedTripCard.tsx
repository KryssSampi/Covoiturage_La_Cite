"use client";

/**
 * @file RecommendedTripCard.tsx
 * @description Carte de trajet pour les résultats de recherche passager.
 *
 * Design basé sur la TripCard de la section "Trajets Recommandés" du dashboard
 * (features/dashboard/components/passenger/recommended-rides.section.tsx),
 * enrichie avec :
 *   - Badge de score de matching (coin supérieur droit)
 *   - Gestion des places disponibles (badge vert/rouge)
 *   - Bouton "Complet" désactivé si aucune place disponible
 *   - Callback onReserve ou redirection /trip-view/:id
 *
 * Layout horizontal :
 *   [Photo conducteur] | [Détails : date · conducteur · trajet · passagers + prix] | [Bouton]
 */

import Link           from "next/link";
import Image          from "next/image";
import { useState }   from "react";
import { useRouter }  from "next/navigation";
import {
  FaStar,
  FaLocationDot,
  FaArrowRight,
} from "react-icons/fa6";
import {
  FaPlusCircle,
  FaUserFriends,
} from "react-icons/fa";

import { Language, useAppState }                    from "@/core/state/app_state";
import { formatDate }                               from "@/core/utils/date.utils";
import type { Trip, Passenger }                     from "@/features/dashboard/types";
import type { MatchingScore }                       from "@/features/search/types/search.feature.types";

// ─── Utilitaire : couleurs du badge matching ──────────────────────────────────

/**
 * Retourne les couleurs et le libellé correspondant au score de matching.
 * Seuils : ≥80 Excellent, ≥60 Bon match, ≥40 Passable, <40 Faible
 */
function matchColor(score: number): {
  bg:    string;
  ring:  string;
  text:  string;
  label: string;
} {
  if (score >= 80) return { bg: "#e8f5e9", ring: "#2e7d32", text: "#1b5e20", label: "Excellent"  };
  if (score >= 60) return { bg: "#e3f2fd", ring: "#1565c0", text: "#0d47a1", label: "Bon match"  };
  if (score >= 40) return { bg: "#fff8e1", ring: "#f57f17", text: "#e65100", label: "Passable"   };
  return            { bg: "#fce4ec", ring: "#c62828", text: "#b71c1c", label: "Faible"     };
}

// ─── Sous-composant : avatars des passagers ───────────────────────────────────

interface PassengerAvatarsProps {
  /** Liste des passagers inscrits sur ce trajet */
  passengers: Passenger[];
  /** État d'ouverture de la liste déroulante */
  isOpen:     boolean;
  /** Basculer l'ouverture */
  onToggle:   () => void;
  /** Fermer la liste */
  onClose:    () => void;
}

/**
 * Affiche les avatars des 2 premiers passagers.
 * Si > 2 passagers, un lien "+N autres" ouvre une liste déroulante.
 */
function PassengerAvatars({
  passengers,
  isOpen,
  onToggle,
  onClose,
}: PassengerAvatarsProps) {
  const { lang } = useAppState();

  return (
    <div className="relative flex items-center gap-2 mt-2">
      {/* Avatars des 2 premiers passagers */}
      {passengers.slice(0, 2).map((p) => (
        <Link key={p.id} href={`/public-profile?accountid=${p.id}`}>
          <Image
            src={p.pictureUrl || "/assets/placeholder/placeholer-profile-picture.png"}
            alt={p.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-[#08316e]"
            width={40}
            height={40}
          />
        </Link>
      ))}

      {/* Si un seul passager, afficher son nom */}
      {passengers.length === 1 && (
        <Link
          href={`/public-profile?accountid=${passengers[0].id}`}
          className="text-sm text-gray-700 hover:text-blue-500 hover:underline"
        >
          {passengers[0].name}
        </Link>
      )}

      {/* Indicateur "+N autres" pour plus de 2 passagers */}
      {passengers.length > 2 && (
        <span
          className="text-sm text-gray-700 hover:text-blue-400 hover:underline cursor-pointer"
          onClick={onToggle}
        >
          +{passengers.length - 2} {lang === Language.FR ? "autres" : "more"}
        </span>
      )}

      {/* Liste déroulante — tous les passagers */}
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
                src={p.pictureUrl || "/assets/placeholder/placeholer-profile-picture.png"}
                alt={p.name}
                className="w-8 h-8 rounded-full object-cover"
                width={32}
                height={32}
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

// ─── Composant principal ──────────────────────────────────────────────────────

export interface RecommendedTripCardProps {
  /** Données du trajet à afficher */
  trip:        Trip;
  /** Score de matching calculé par usePassengerSearch (optionnel) */
  score?:      MatchingScore;
  /** Indique si cette carte est la sélection active (polyline affichée sur la carte) */
  isSelected?: boolean;
  /** Callback déclenché au clic sur la carte — affiche la polyline sur la carte */
  onSelect?:   (trip: Trip) => void;
  /** Callback de réservation — si absent, redirige vers /trip-view/:id */
  onReserve?:  (tripId: number) => void;
}

/**
 * Carte de trajet riche pour les résultats de recherche passager.
 *
 * Affiche :
 * - Photo du conducteur (grande, à gauche)
 * - Date et heure de départ
 * - Nom du conducteur (lien profil) + note moyenne + nombre de trajets
 * - Itinéraire départ → destination avec icônes
 * - Avatars des passagers inscrits + compteur places libres/occupées
 * - Prix en CAD
 * - Badge de score de matching (coin supérieur droit) si disponible
 * - Bouton "Réserver" ou "Complet" (désactivé)
 */
export function RecommendedTripCard({
  trip,
  score,
  isSelected = false,
  onSelect,
  onReserve,
}: RecommendedTripCardProps) {
  const { lang } = useAppState();
  const router   = useRouter();

  // État de la liste déroulante des passagers
  const [isPassengerListOpen, setIsPassengerListOpen] = useState(false);

  // Calcul des places disponibles
  const seatsLeft = trip.maxPassengers - trip.passengers.length;
  const isFull    = seatsLeft <= 0;

  // Couleurs du badge matching
  const mc = score ? matchColor(score.total) : null;

  /** Navigation vers la page de détails ou callback externe */
  function handleReserve(e: React.MouseEvent) {
    // Empêche le clic de remonter sur la carte (qui déclencherait onSelect)
    e.stopPropagation();
    if (onReserve) {
      onReserve(trip.id);
    } else {
      router.push(`/trip-view/${trip.id}`);
    }
  }

  return (
    <div
      className="w-full flex flex-row justify-between items-center gap-x-4 rounded-xl shadow-xl bg-gray-100 p-4 mb-2 hover:shadow-2xl hover:scale-[1.01] transition-all active:scale-[0.99] relative overflow-visible"
      style={{
        cursor:  onSelect ? "pointer" : "default",
        outline: isSelected ? "2.5px solid #08316e" : "none",
        boxShadow: isSelected
          ? "0 0 0 3px #08316e33, 0 6px 24px rgba(8,49,110,0.18)"
          : undefined,
        background: isSelected ? "#eef4ff" : undefined,
      }}
      onClick={() => onSelect?.(trip)}
    >

      {/* ── Badge matching score — coin supérieur droit ────────────────────── */}
      {mc && score && (
        <div
          className="absolute top-3 right-3 flex flex-col items-center rounded-xl px-2 py-1 z-10"
          style={{
            background: mc.bg,
            border:     `1.5px solid ${mc.ring}55`,
          }}
          title={`Score de correspondance : ${score.total}/100\nGéo départ: ${score.geoDepart}/30 · Géo arrivée: ${score.geoArrivee}/30\nHoraire: ${score.horaire}/20 · Note: ${score.noteConducteur}/10 · Places: ${score.places}/10`}
        >
          <span
            className="text-base font-extrabold leading-none"
            style={{ color: mc.text }}
          >
            {score.total}
          </span>
          <span
            className="text-[9px] font-bold tracking-wide uppercase"
            style={{ color: mc.text }}
          >
            {mc.label}
          </span>
        </div>
      )}

      {/* ── Photo de profil du conducteur ─────────────────────────────────── */}
      <div className="shrink-0">
        <Image
          src={trip.driver.pictureUrl || "/assets/placeholder/placeholer-profile-picture.png"}
          alt={trip.driver.name}
          className="w-24 h-32 rounded-xl object-cover"
          width={200}
          height={280}
        />
      </div>

      {/* ── Séparateur vertical ───────────────────────────────────────────── */}
      <div className="w-px h-28 bg-gray-400 shrink-0" />

      {/* ── Bloc principal des détails ────────────────────────────────────── */}
      <div className="flex flex-col items-start w-full pr-28 gap-0.5">

        {/* Date et heure */}
        <span className="text-lg font-semibold text-black">
          {formatDate(trip.date, lang)}&nbsp;:&nbsp;{trip.time}
        </span>

        {/* Conducteur : nom + note + nombre de trajets */}
        <div className="flex items-center text-black text-base gap-2 flex-wrap">
          <span className="text-gray-600 text-sm">
            {lang === Language.FR ? "Avec :" : "With:"}
          </span>
          <Link
            href={`/public-profile?accountid=${trip.driver.id}`}
            className="text-base font-semibold truncate max-w-40 text-blue-500 hover:text-blue-700 hover:underline"
            title={trip.driver.name}
          >
            {trip.driver.name}
          </Link>
          <span className="text-yellow-400 text-sm flex gap-1 items-center">
            <FaStar />
            <strong className="text-gray-800">{trip.driver.rating.toFixed(1)}</strong>
            <span className="text-gray-500 text-xs">
              ({trip.driver.tripsCount} {lang === Language.FR ? "trajets" : "trips"})
            </span>
          </span>
        </div>

        {/* Itinéraire départ → destination */}
        <p className="flex gap-1 items-baseline text-base text-[#08316e]">
          <FaLocationDot className="shrink-0 mt-0.5" />
          <span className="truncate max-w-28 text-black font-bold" title={trip.departure}>
            {trip.departure}
          </span>
          <FaArrowRight className="mx-2 shrink-0" />
          <span className="truncate max-w-28 text-black font-bold" title={trip.destination}>
            {trip.destination}
          </span>
        </p>

        {/* Ligne du bas : avatars passagers | places libres | prix */}
        <div className="w-full flex justify-between items-center flex-wrap gap-2">

          {/* Avatars des passagers inscrits */}
          <PassengerAvatars
            passengers={trip.passengers}
            isOpen={isPassengerListOpen}
            onToggle={() => setIsPassengerListOpen((v) => !v)}
            onClose={() => setIsPassengerListOpen(false)}
          />

          {/* Compteur places + prix */}
          <div className="flex items-center gap-4 ml-auto">

            {/* Places libres / occupées */}
            <div className="flex items-center gap-1">
              <span
                className={`text-base font-semibold ${isFull ? "text-red-500" : "text-gray-700"}`}
              >
                {trip.passengers.length}/{trip.maxPassengers}
              </span>
              <FaUserFriends className="text-[#08316e] text-lg" />
              {!isFull && (
                <span className="text-xs font-medium text-green-700 bg-green-100 rounded-full px-2 py-0.5">
                  {seatsLeft} {lang === Language.FR
                    ? `place${seatsLeft > 1 ? "s" : ""} libre${seatsLeft > 1 ? "s" : ""}`
                    : `seat${seatsLeft > 1 ? "s" : ""} free`}
                </span>
              )}
              {isFull && (
                <span className="text-xs font-bold text-red-700 bg-red-100 rounded-full px-2 py-0.5">
                  {lang === Language.FR ? "Complet" : "Full"}
                </span>
              )}
            </div>

            {/* Prix */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                {lang === Language.FR ? "Prix" : "Price"}
              </span>
              <span className="text-lg font-extrabold text-red-500">
                {trip.price}&nbsp;<span className="text-xs font-semibold text-gray-500">CAD</span>
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* ── Bouton Réserver ───────────────────────────────────────────────── */}
      <div className="flex flex-col justify-center items-center shrink-0 w-24">
        <button
          disabled={isFull}
          className="w-full font-bold py-2 px-3 rounded-full text-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1"
          style={{
            background: isFull ? "#94a3b8" : "#08316e",
            color:      "#fff",
          }}
          onMouseEnter={(e) => {
            if (!isFull) (e.currentTarget as HTMLButtonElement).style.background = "#06214a";
          }}
          onMouseLeave={(e) => {
            if (!isFull) (e.currentTarget as HTMLButtonElement).style.background = "#08316e";
          }}
          onClick={handleReserve}        >
          <FaPlusCircle />
          {isFull
            ? (lang === Language.FR ? "Complet" : "Full")
            : (lang === Language.FR ? "Réserver" : "Book")}
        </button>
      </div>

    </div>
  );
}
