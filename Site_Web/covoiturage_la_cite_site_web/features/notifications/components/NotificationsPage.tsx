"use client";

/**
 * NotificationsPage — Liste + détail des notifications (NotificationModel)
 *
 * Panneau détail contextuel par type :
 * - Bouton d'action avec libellé et lien adaptés à la catégorie
 * - Payloads enrichis (tripDetails, reservationDetails, reviewDetails, securityDetails) affichés
 */

import React, { useCallback } from "react";
import Link from "next/link";
import {
  FaCalendarDays, FaClock, FaCircle, FaEnvelope, FaEnvelopeOpen,
  FaArrowRight, FaBell, FaStar, FaTriangleExclamation,
  FaCircleCheck, FaCircleXmark, FaShield, FaLocationDot, FaDollarSign, FaUser,
} from "react-icons/fa6";
import { Language, useAppState } from "@/core/state/app_state";
import { ListDetailPage } from "@/shared/components/list-detail-page";
import type { NotificationModel, NotificationType } from "@/core/models/NotificationModel";
import { IMPORTANT_NOTIFICATION_TYPES } from "@/core/models/NotificationModel";
import { useNotificationsConfig } from "../hooks/useNotificationsList";

// ─── Icône par type ───────────────────────────────────────────────────────────

function NotifIcon({ type }: { type: NotificationType }) {
  const urgent = IMPORTANT_NOTIFICATION_TYPES.includes(type);
  const cls = `w-5 h-5 ${urgent ? "text-red-500" : "text-[#08316e]"}`;
  switch (type) {
    case "reservation_received":   return <FaBell className={cls} />;
    case "reservation_sent":       return <FaCircleCheck className="w-5 h-5 text-blue-500" />;
    case "reservation_accepted":   return <FaCircleCheck className={cls} />;
    case "reservation_refused":
    case "reservation_cancelled":
    case "trip_cancelled":         return <FaCircleXmark className="w-5 h-5 text-red-500" />;
    case "trip_created":
    case "trip_completed":         return <FaCircleCheck className={cls} />;
    case "trip_starting_soon":
    case "trip_started":           return <FaCalendarDays className={cls} />;
    case "new_review_received":    return <FaStar className="w-5 h-5 text-yellow-500" />;
    case "cancellation_penalty":   return <FaTriangleExclamation className={cls} />;
    case "security_alert":         return <FaShield className={cls} />;
    default:                       return <FaBell className={cls} />;
  }
}

// ─── Libellé du type ─────────────────────────────────────────────────────────

function typeLabel(type: NotificationType, isFR: boolean): string {
  const t: Record<NotificationType, string> = {
    reservation_received:  isFR ? "Nouvelle demande"       : "New Request",
    reservation_sent:      isFR ? "Demande envoyée"        : "Request Sent",
    reservation_accepted:  isFR ? "Réservation confirmée"  : "Reservation Confirmed",
    reservation_refused:   isFR ? "Demande non retenue"    : "Request Declined",
    reservation_cancelled: isFR ? "Réservation annulée"    : "Reservation Cancelled",
    trip_created:          isFR ? "Trajet publié"          : "Trip Published",
    trip_starting_soon:    isFR ? "Départ imminent"        : "Departure Imminent",
    trip_started:          isFR ? "Trajet démarré"         : "Trip Started",
    trip_completed:        isFR ? "Trajet terminé"         : "Trip Completed",
    trip_cancelled:        isFR ? "Trajet annulé"          : "Trip Cancelled",
    new_review_received:   isFR ? "Nouvel avis"            : "New Review",
    cancellation_penalty:  isFR ? "Pénalité appliquée"     : "Penalty Applied",
    security_alert:        isFR ? "Alerte de sécurité"     : "Security Alert",
    system:                isFR ? "Information"            : "Information",
  };
  return t[type] ?? "Notification";
}

// ─── Label de bouton par défaut ───────────────────────────────────────────────

function defaultLinkLabel(type: NotificationType, isFR: boolean): string {
  const l: Partial<Record<NotificationType, string>> = {
    reservation_received:  isFR ? "Voir les demandes"        : "See Requests",
    reservation_sent:      isFR ? "Voir ma demande"          : "See My Request",
    reservation_accepted:  isFR ? "Voir le trajet"           : "See Trip",
    reservation_refused:   isFR ? "Chercher un autre trajet" : "Find Another Trip",
    reservation_cancelled: isFR ? "Voir mes réservations"    : "See Reservations",
    trip_created:          isFR ? "Voir le trajet"           : "See Trip",
    trip_starting_soon:    isFR ? "Suivre le trajet"         : "Track Trip",
    trip_started:          isFR ? "Suivre le trajet"         : "Track Trip",
    trip_completed:        isFR ? "Voir le résumé"           : "See Summary",
    trip_cancelled:        isFR ? "Chercher un autre trajet" : "Find Another Trip",
    new_review_received:   isFR ? "Voir l'avis"              : "See Review",
    cancellation_penalty:  isFR ? "Voir les pénalités"       : "See Penalties",
    security_alert:        isFR ? "Voir l'activité récente"  : "See Activity",
    system:                isFR ? "Suivre le lien attaché"   : "Follow Link",
  };
  return l[type] ?? (isFR ? "En savoir plus" : "Learn More");
}

// ─── Carte de listing ─────────────────────────────────────────────────────────

function NotificationListCard({ notification, isFR }: { notification: NotificationModel; isFR: boolean }) {
  const urgent  = IMPORTANT_NOTIFICATION_TYPES.includes(notification.type);
  const date    = new Date(notification.createdAt);
  const dateStr = date.toLocaleDateString(isFR ? "fr-CA" : "en-CA", { day: "numeric", month: "short" });
  const timeStr = date.toLocaleTimeString(isFR ? "fr-CA" : "en-CA", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg ${urgent ? "bg-red-50" : ""}`}>
      <div className="shrink-0"><NotifIcon type={notification.type} /></div>
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-bold truncate ${urgent ? "text-red-600" : "text-[#08316e]"}`}>
            {notification.title}
          </span>
          {!notification.isRead && <div className="w-2 h-2 rounded-full bg-[#08316e] shrink-0" />}
        </div>
        <p className="text-[10px] text-gray-500">{dateStr} — {timeStr}</p>
        <p className="text-xs text-gray-700 truncate">{notification.message}</p>
      </div>
    </div>
  );
}

// ─── Ligne de détail ──────────────────────────────────────────────────────────

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="flex items-center">{icon}</span>
      <span className="text-gray-500 w-16 shrink-0">{label}</span>
      <span className="font-medium text-gray-800 truncate">{value}</span>
    </div>
  );
}

// ─── Panneau détail ───────────────────────────────────────────────────────────

function NotificationDetail({
  notification, userId, role, isFR, onRead,
}: {
  notification: NotificationModel;
  userId: string;
  role: string;
  isFR: boolean;
  onRead?: (id: string) => void;
}) {
  // Marquer comme lu au premier affichage du détail
  React.useEffect(() => { onRead?.(notification.id); }, [notification.id, onRead]);

  const urgent  = IMPORTANT_NOTIFICATION_TYPES.includes(notification.type);
  const subject = typeLabel(notification.type, isFR);
  const date    = new Date(notification.createdAt);
  const dateStr = date.toLocaleDateString(isFR ? "fr-CA" : "en-CA", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeStr = date.toLocaleTimeString(isFR ? "fr-CA" : "en-CA", { hour: "2-digit", minute: "2-digit" });

  const href  = notification.link;
  const label = notification.linkLabel ?? defaultLinkLabel(notification.type, isFR);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* En-tête */}
      <div className="px-5 pt-5 pb-4 border-b" style={{ borderColor: "#e5e7eb" }}>
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5"
            style={{ backgroundColor: urgent ? "#fef2f2" : "#e8eef7" }}
          >
            <NotifIcon type={notification.type} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold leading-tight" style={{ color: urgent ? "#dc2626" : "#08316e" }}>
              {subject}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isFR ? "De" : "From"} : La Cité Covoiturage
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <FaCalendarDays size={11} color="#08316e" /><span>{dateStr}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <FaClock size={11} color="#08316e" /><span>{timeStr}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {notification.isRead
              ? <><FaEnvelopeOpen size={11} color="#6b7280" /><span className="text-gray-400">{isFR ? "Lu" : "Read"}</span></>
              : <><FaEnvelope size={11} color="#08316e" /><span className="text-[#08316e] font-semibold">{isFR ? "Non lu" : "Unread"}</span></>
            }
          </div>
        </div>
      </div>

      {/* Corps */}
      <div className="px-5 py-4 flex flex-col gap-4 flex-1 overflow-y-auto">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{notification.message}</p>

        {/* Détails trajet */}
        {notification.tripDetails && (
          <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-1.5">
            <p className="text-[11px] font-semibold text-[#08316e] uppercase tracking-wide mb-1">
              {isFR ? "Trajet concerné" : "Trip Details"}
            </p>
            <DetailRow icon={<FaLocationDot size={11} color="#08316e" />} label={isFR ? "De" : "From"} value={notification.tripDetails.departure} />
            <DetailRow icon={<FaArrowRight size={11} color="#08316e" />} label={isFR ? "Vers" : "To"} value={notification.tripDetails.arrival} />
            <DetailRow icon={<FaCalendarDays size={11} color="#08316e" />} label={isFR ? "Date" : "Date"} value={`${notification.tripDetails.date} à ${notification.tripDetails.time}`} />
            <DetailRow icon={<FaDollarSign size={11} color="#08316e" />} label={isFR ? "Tarif" : "Price"} value={`${notification.tripDetails.price.toFixed(2)} $`} />
            {notification.tripDetails.estimatedDurationMinutes && (
              <DetailRow icon={<FaClock size={11} color="#08316e" />} label={isFR ? "Durée" : "Duration"} value={`${notification.tripDetails.estimatedDurationMinutes} min`} />
            )}
            {notification.tripDetails.availableSeats !== undefined && (
              <DetailRow icon={<FaUser size={11} color="#08316e" />} label={isFR ? "Places" : "Seats"} value={`${notification.tripDetails.availableSeats} disponible${notification.tripDetails.availableSeats > 1 ? "s" : ""}`} />
            )}
          </div>
        )}

        {/* Détails réservation */}
        {notification.reservationDetails && (
          <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-1.5">
            <p className="text-[11px] font-semibold text-[#08316e] uppercase tracking-wide mb-1">
              {isFR ? "Parties concernées" : "People Involved"}
            </p>
            {notification.reservationDetails.passengerName && (
              <DetailRow icon={<FaUser size={11} color="#08316e" />} label={isFR ? "Passager" : "Passenger"} value={
                notification.reservationDetails.passengerName +
                (notification.reservationDetails.passengerRating ? ` — ${notification.reservationDetails.passengerRating}★` : "")
              } />
            )}
            {notification.reservationDetails.driverName && (
              <DetailRow icon={<FaUser size={11} color="#08316e" />} label={isFR ? "Conducteur" : "Driver"} value={notification.reservationDetails.driverName} />
            )}
          </div>
        )}

        {/* Détails avis */}
        {notification.reviewDetails && (
          <div className="bg-yellow-50 rounded-xl p-3 flex flex-col gap-1.5">
            <p className="text-[11px] font-semibold text-yellow-700 uppercase tracking-wide mb-1">
              {isFR ? "Avis reçu" : "Review Received"}
            </p>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <FaStar key={i} size={14} color={i < Math.round(notification.reviewDetails!.rating) ? "#f59e0b" : "#d1d5db"} />
              ))}
              <span className="text-xs font-semibold text-gray-700 ml-1">{notification.reviewDetails.rating}/5</span>
            </div>
            {notification.reviewDetails.comment && (
              <p className="text-xs text-gray-600 italic mt-1">&ldquo;{notification.reviewDetails.comment}&rdquo;</p>
            )}
            <p className="text-[10px] text-gray-400">{isFR ? "Par" : "By"} {notification.reviewDetails.reviewerName}</p>
          </div>
        )}

        {/* Détails sécurité */}
        {notification.securityDetails && (
          <div className="bg-red-50 rounded-xl p-3 flex flex-col gap-1">
            <p className="text-[11px] font-semibold text-red-600 uppercase tracking-wide mb-1">
              {isFR ? "Détails de connexion" : "Connection Details"}
            </p>
            <p className="text-xs text-gray-600">
              {isFR ? "Type" : "Type"} : {notification.securityDetails.clientType === "web" ? "Navigateur web" : "Application mobile"}
            </p>
            {notification.securityDetails.location && (
              <p className="text-xs text-gray-600">{isFR ? "Lieu" : "Location"} : {notification.securityDetails.location}</p>
            )}
          </div>
        )}
      </div>

      {/* Bouton d'action contextuel */}
      {href && (
        <div className="px-5 pb-3">
          <Link
            href={href}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#08316e" }}
          >
            {label}
            <FaArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* Pied */}
      <div className="px-5 py-4 border-t" style={{ borderColor: "#e5e7eb" }}>
        <div className="flex items-center gap-2">
          <FaCircle size={6} color={notification.isRead ? "#d1d5db" : "#08316e"} />
          <span className="text-[10px] text-gray-400">
            {isFR ? "Notification automatique" : "Automatic notification"} — La Cité Covoiturage
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

interface NotificationsPageProps {
  items: NotificationModel[];
  onRead?: (id: string) => void;
}

export function NotificationsPage({ items, onRead }: NotificationsPageProps) {
  const { lang, userConnected } = useAppState();
  const isFR   = lang === Language.FR;
  const userId = userConnected?.id ?? "";
  const role   = userConnected?.role ?? "passenger";

  const { filterGroups, sortOptions, searchKeys, emptyMessage } = useNotificationsConfig();

  const renderCard = useCallback(
    (n: NotificationModel) => <NotificationListCard notification={n} isFR={isFR} />,
    [isFR],
  );

  const renderDetail = useCallback(
    (n: NotificationModel) => (
      <NotificationDetail notification={n} userId={userId} role={role} isFR={isFR} onRead={onRead} />
    ),
    [isFR, userId, role, onRead],
  );

  return (
    <ListDetailPage
      items={items}
      renderCard={renderCard}
      renderDetail={renderDetail}
      filterGroups={filterGroups}
      sortOptions={sortOptions}
      searchKeys={searchKeys}
      withOverview={true}
      emptyMessage={emptyMessage}
      itemParamKey="notificationid"
    />
  );
}
