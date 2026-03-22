"use client";

/**
 * Page de listing des notifications.
 * Commun aux deux rôles. Utilise ListDetailPage avec le hook useNotificationsList.
 * Le panneau détail affiche une notification au format mail professionnel
 * (objet, date de réception, contenu).
 */

import { useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaStar } from "react-icons/fa";
import {
  FaMessage,
  FaCalendarDays,
  FaClock,
  FaCircle,
  FaEnvelope,
  FaEnvelopeOpen,
  FaBell,
  FaArrowRight,
} from "react-icons/fa6";

import { Language, useAppState } from "@/core/state/app_state";
import { formatDate } from "@/core/utils/date.utils";
import { ListDetailPage } from "@/shared/components/list-detail-page";
import {
  NotificationType,
  IMPORTANT_NOTIFICATION_TYPES,
  type Notification,
} from "@/features/dashboard/types/notification.types";
import { useNotificationsList } from "../hooks/useNotificationsList";

// ─── Sous-composant icône (repris de notifications.section.tsx) ──────────────

function NotificationIcon({ type }: { type: NotificationType }) {
  const iconProps = { width: 40, height: 30 };

  switch (type) {
    case NotificationType.Confirmation:
      return <Image src="/assets/notification-icons/check.png" alt="Confirmation" {...iconProps} />;
    case NotificationType.UrgentRappel:
    case NotificationType.Retard:
      return <Image src="/assets/notification-icons/rappel-urgent.png" alt="Urgent" {...iconProps} />;
    case NotificationType.Annulation:
      return <Image src="/assets/notification-icons/canceled.png" alt="Annulation" {...iconProps} />;
    case NotificationType.Infos:
      return <Image src="/assets/notification-icons/info.png" alt="Info" {...iconProps} />;
    case NotificationType.Rappel:
      return <Image src="/assets/notification-icons/rappel.png" alt="Rappel" {...iconProps} />;
    case NotificationType.NouvelleAvis:
      return <FaStar className="text-[#08316e] text-xl" />;
    case NotificationType.AlerteTrajet:
      return <FaBell className="text-[#08316e] text-xl" />;
    default:
      return <FaMessage className="text-[#08316e] text-xl" />;
  }
}

// ─── Sous-composant titre (repris de notifications.section.tsx) ──────────────

function getNotificationSubject(type: NotificationType, lang: Language): string {
  const isFR = lang === Language.FR;
  switch (type) {
    case NotificationType.Confirmation:  return "Confirmation";
    case NotificationType.UrgentRappel:  return isFR ? "Rappel Urgent" : "Urgent Reminder";
    case NotificationType.Annulation:    return isFR ? "Annulation" : "Cancellation";
    case NotificationType.Retard:        return isFR ? "Retard" : "Delay";
    case NotificationType.Infos:         return "Information";
    case NotificationType.Rappel:        return isFR ? "Rappel" : "Reminder";
    case NotificationType.NouvelleAvis:  return isFR ? "Nouvel Avis" : "New Review";
    case NotificationType.AlerteTrajet:  return isFR ? "Alerte Trajet" : "Trip Alert";
    default:                             return "Notification";
  }
}

function NotificationTitle({ type, lang }: { type: NotificationType; lang: Language }) {
  const isFR = lang === Language.FR;

  switch (type) {
    case NotificationType.Confirmation:
      return <span className="text-black font-bold text-xs">Confirmation</span>;
    case NotificationType.UrgentRappel:
      return (
        <span className="text-black font-bold text-xs">
          {isFR ? "Rappel Urgent" : "Urgent Reminder"}
          <span className="text-red-500 ml-1">!!!</span>
        </span>
      );
    case NotificationType.Annulation:
      return (
        <span className="text-black font-bold text-xs">
          {isFR ? "Annulation" : "Cancellation"}
          <span className="text-red-500 ml-1">!!!</span>
        </span>
      );
    case NotificationType.Retard:
      return <span className="text-red-500 font-bold text-xs">{isFR ? "Retard" : "Delay"} !!!</span>;
    case NotificationType.Infos:
      return <span className="text-black font-bold text-xs">Information</span>;
    case NotificationType.Rappel:
      return <span className="text-black font-bold text-xs">{isFR ? "Rappel" : "Reminder"}</span>;
    case NotificationType.NouvelleAvis:
      return <span className="text-black font-bold text-xs">{isFR ? "Nouvel Avis" : "New Review"}</span>;
    case NotificationType.AlerteTrajet:
      return (
        <span className="text-[#08316e] font-bold text-xs">
          {isFR ? "Alerte Trajet" : "Trip Alert"}
        </span>
      );
    default:
      return <span className="text-black font-bold text-xs">Notification</span>;
  }
}

// ─── Carte de notification pour le listing ───────────────────────────────────

function NotificationListCard({
  notification,
  lang,
}: {
  notification: Notification;
  lang: Language;
}) {
  const isUrgent = IMPORTANT_NOTIFICATION_TYPES.includes(notification.type);

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg ${isUrgent ? "bg-red-50" : ""}`}>
      {/* Icone */}
      <div className="shrink-0">
        <NotificationIcon type={notification.type} />
      </div>

      {/* Contenu */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <NotificationTitle type={notification.type} lang={lang} />
          {/* Point non-lu */}
          {!notification.isRead && (
            <div className="w-2 h-2 rounded-full bg-[#08316e] shrink-0" />
          )}
        </div>
        <p className="text-[10px] text-gray-500">
          {formatDate(notification.date, lang)} — {notification.time}
        </p>
        <p className="text-xs text-gray-700 truncate">{notification.message}</p>
      </div>
    </div>
  );
}

// ─── Panneau détail : notification au format mail professionnel ──────────────

function NotificationMailDetail({
  notification,
  lang,
}: {
  notification: Notification;
  lang: Language;
}) {
  const isFR = lang === Language.FR;
  const isUrgent = IMPORTANT_NOTIFICATION_TYPES.includes(notification.type);
  const subject = getNotificationSubject(notification.type, lang);

  // Résoudre le lien dynamique en remplaçant les placeholders par les vraies valeurs
  const appState = useAppState();
  const resolvedLink = notification.link
    ? notification.link.replace(
        /\/(passenger|driver)\/search\/me/,
        `/${appState.userConnected?.role?.toString().toLowerCase() ?? 'passenger'}/search/${appState.userConnected?.id ?? 'me'}`,
      )
    : undefined;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* En-tête du mail */}
      <div
        className="px-5 pt-5 pb-4 border-b"
        style={{ borderColor: "#e5e7eb" }}
      >
        {/* Objet */}
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5"
            style={{ backgroundColor: isUrgent ? "#fef2f2" : "#e8eef7" }}
          >
            <NotificationIcon type={notification.type} />
          </div>
          <div className="flex-1 min-w-0">
            <h2
              className="text-base font-bold leading-tight"
              style={{ color: isUrgent ? "#dc2626" : "#08316e" }}
            >
              {subject}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isFR ? "De" : "From"} : La Cite Covoiturage
            </p>
          </div>
        </div>

        {/* Métadonnées */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <FaCalendarDays size={11} color="#08316e" />
            <span>{formatDate(notification.date, lang)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <FaClock size={11} color="#08316e" />
            <span>{notification.time}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {notification.isRead ? (
              <>
                <FaEnvelopeOpen size={11} color="#6b7280" />
                <span className="text-gray-400">{isFR ? "Lu" : "Read"}</span>
              </>
            ) : (
              <>
                <FaEnvelope size={11} color="#08316e" />
                <span className="text-[#08316e] font-semibold">
                  {isFR ? "Non lu" : "Unread"}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Corps du message */}
      <div className="flex-1 px-5 py-5">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {notification.message}
        </p>
      </div>

      {/* Lien vers la page de recherche (AlerteTrajet) */}
      {resolvedLink && (
        <div className="px-5 pb-3">
          <Link
            href={resolvedLink}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ background: "#08316e" }}
          >
            {isFR ? "Voir les trajets disponibles" : "See available trips"}
            <FaArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* Pied de page */}
      <div className="px-5 py-4 border-t" style={{ borderColor: "#e5e7eb" }}>
        <div className="flex items-center gap-2">
          <FaCircle size={6} color={notification.isRead ? "#d1d5db" : "#08316e"} />
          <span className="text-[10px] text-gray-400">
            {isFR ? "Notification automatique" : "Automatic notification"} — La Cite Covoiturage
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ─────────────────────────────────────────────────────────

export function NotificationsPage() {
  const { lang } = useAppState();
  const { items, filterGroups, sortOptions, searchKeys, emptyMessage } = useNotificationsList();

  const renderCard = useCallback(
    (notification: Notification) => (
      <NotificationListCard notification={notification} lang={lang} />
    ),
    [lang],
  );

  // Rendu détail : notification au format mail professionnel
  const renderDetail = useCallback(
    (notification: Notification) => (
      <NotificationMailDetail notification={notification} lang={lang} />
    ),
    [lang],
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
