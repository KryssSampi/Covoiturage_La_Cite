"use client";

import Link from "next/link";
import { FaBell } from "react-icons/fa6";

import { Language } from "@/core/state/app_state";
import { type Notification } from "@/features/dashboard/types/notification.types";
import { NotificationItem } from "./NotificationItem";

// ─── Props ────────────────────────────────────────────────────────────────────

interface NotificationsDropdownProps {
  notifications: Notification[];
  lang: Language;
  /** ID de l'utilisateur connecté — pour construire le lien "Tout voir" */
  userId: string;
  /** Rôle pour construire le chemin vers la page notifications */
  role: "driver" | "passenger";
  onClose: () => void;
}

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * Dropdown de notifications pour le header.
 * Affiche les 5 notifications les plus récentes (non lues en premier).
 * Lien "Tout voir" vers la page dédiée.
 */
export function NotificationsDropdown({
  notifications,
  lang,
  userId,
  role,
  onClose,
}: NotificationsDropdownProps) {
  const isFR = lang === Language.FR;

  // Trier : non lues en premier, puis par date décroissante
  const sorted = [...notifications].sort((a, b) => {
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
    return b.createdAt.localeCompare(a.createdAt);
  });

  const preview = sorted.slice(0, 5);
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const notifPageHref = `/${role}/${userId}?section=notifications`;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
      {/* En-tête */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <FaBell size={14} color="#08316e" />
          <span className="text-sm font-semibold text-[#08316e]">
            {isFR ? "Notifications" : "Notifications"}
          </span>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold text-white bg-red-500 rounded-full px-1.5 py-0.5 leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xs"
          aria-label={isFR ? "Fermer" : "Close"}
        >
          ✕
        </button>
      </div>

      {/* Liste */}
      <div className="divide-y divide-gray-50">
        {preview.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">
            {isFR ? "Aucune notification" : "No notifications"}
          </p>
        ) : (
          preview.map((notif) => (
            <div key={notif.id} onClick={onClose}>
              <NotificationItem notification={notif} lang={lang} compact />
            </div>
          ))
        )}
      </div>

      {/* Pied — lien vers page complète */}
      <div className="border-t border-gray-100 px-4 py-2.5">
        <Link
          href={notifPageHref}
          onClick={onClose}
          className="text-xs font-semibold text-[#08316e] hover:underline"
        >
          {isFR ? "Voir toutes les notifications →" : "See all notifications →"}
        </Link>
      </div>
    </div>
  );
}
