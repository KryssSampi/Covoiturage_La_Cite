"use client";

import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { FaMessage, FaBell } from "react-icons/fa6";

import { Language } from "@/core/state/app_state";
import { formatDate } from "@/core/utils/date.utils";
import {
  NotificationType,
  IMPORTANT_NOTIFICATION_TYPES,
  type Notification,
} from "@/features/dashboard/types/notification.types";

// ─── Icône par type ───────────────────────────────────────────────────────────

export function NotificationIcon({ type }: { type: NotificationType }) {
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

// ─── Props ────────────────────────────────────────────────────────────────────

interface NotificationItemProps {
  notification: Notification;
  lang: Language;
  /** Mode compact — moins de padding, texte plus petit (pour dropdown) */
  compact?: boolean;
}

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * Ligne de notification réutilisable.
 * Utilisé dans NotificationsPage (listing) et NotificationsDropdown (header).
 */
export function NotificationItem({ notification, lang, compact = false }: NotificationItemProps) {
  const isUrgent = IMPORTANT_NOTIFICATION_TYPES.includes(notification.type);

  return (
    <div
      className={`flex items-center gap-3 rounded-lg ${compact ? "p-2" : "p-3"} ${isUrgent ? "bg-red-50" : ""}`}
    >
      {/* Icône */}
      <div className="shrink-0">
        <NotificationIcon type={notification.type} />
      </div>

      {/* Contenu */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-bold truncate ${compact ? "text-[11px]" : "text-xs"} ${isUrgent ? "text-red-600" : "text-black"}`}
          >
            {notification.title}
          </span>
          {!notification.isRead && (
            <div className="w-2 h-2 rounded-full bg-[#08316e] shrink-0" />
          )}
        </div>
        <p className="text-[10px] text-gray-400">
          {formatDate(notification.date, lang)} — {notification.time}
        </p>
        {!compact && (
          <p className="text-xs text-gray-700 truncate">{notification.message}</p>
        )}
      </div>
    </div>
  );
}
