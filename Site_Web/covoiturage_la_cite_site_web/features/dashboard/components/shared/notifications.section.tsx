"use client";

/**
 * @file notifications.section.tsx
 * @description Section "Mes Notifications" du dashboard — commune à tous les rôles.
 *
 * Affiche un aperçu des dernières notifications de l'utilisateur (max 6).
 * Les notifications urgentes (Retard, UrgentRappel) sont mises en avant
 * avec un fond rouge et une animation pulse.
 * Un clic redirige vers la page détail /notifications.
 *
 * @uses useNotifications — tri, comptage non-lus, détection urgence
 * @uses Notification, NotificationType — types depuis dashboard/types
 * @uses formatDate — utilitaire partagé depuis shared/utils
 * @uses FIXTURE_NOTIFICATIONS — données de test (à remplacer par API)
 */

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaStar } from "react-icons/fa";
import { FaMessage, FaBell } from "react-icons/fa6";
import { useRouter } from "next/navigation";

import { Language, useAppState } from "@/core/state/app_state";
import { formatDate } from "@/core/utils/date.utils";

import { useNotifications } from "../../hooks/useNotifications";
import { Notification, NotificationType } from "../../types/notification.types";

// ─── Composant principal ─────────────────────────────────────────────────────

/**
 * NotificationsSection
 *
 * @param notifications Liste des notifications de l'utilisateur.
 *   Par défaut : données de test (FIXTURE_NOTIFICATIONS).
 *   TODO: Brancher sur GET /api/users/{userId}/notifications?limit=6&unreadFirst=true
 */
export function NotificationsSection({
  notifications: rawNotifications = [],
}: {
  notifications?: Notification[];
}) {
  const appState = useAppState();
  const router = useRouter();
  const isFR = appState.lang === Language.FR;
  const isDriver = appState.userConnected?.role === "driver";

  // Si aucune notification passée en prop, tenter une récupération BFF + polling léger
  const [localNotifications, setLocalNotifications] = useState<Notification[]>(rawNotifications);
  useEffect(() => {
    let cancelled = false;
    async function fetchNotifications() {
      try {
        const res = await fetch('/api/notifications', { credentials: 'same-origin' });
        if (!res.ok || cancelled) return;
        const data: Notification[] = await res.json();
        if (!cancelled) setLocalNotifications(data);
      } catch (err) {
        console.error('[NotificationsSection] fetch', err);
      }
    }
    if ((rawNotifications ?? []).length === 0 && appState.userConnected) {
      void fetchNotifications();
      const id = setInterval(fetchNotifications, 30_000);
      return () => { cancelled = true; clearInterval(id); };
    }
    return () => { cancelled = true; };
  }, [rawNotifications, appState.userConnected]);

  const { unreadCount, unreadBadgeLabel, displayedNotifications, isImportant } =
    useNotifications(localNotifications);

  return (
    <section
      className={`w-full py-5 border rounded-lg shadow-md p-6
        ${unreadCount !== 0 ? " section-pulse " : ""}
        ${isDriver ? "bg-[#08316e]" : unreadCount !== 0 ? "bg-gray-200" : "bg-[#f8f8f8]"}`}
          style={{ '--bg': isDriver ? '#08316e' : '#f8f8f8' } as React.CSSProperties}
    >
      {/* ─── En-tête ────────────────────────────────────────────────────── */}
      <div className="w-full justify-between flex mx-auto items-center">
        <p
          className={`text-2xl w-full mx-auto flex items-center font-bold ${
            isDriver ? "text-white" : "text-black"
          }`}
        >
          {isFR ? "Mes Notifications" : "My Notifications"}

          {/* Badge compteur non-lus */}
          {unreadCount > 0 && (
            <span className="text-white text-lg w-5 h-5 rounded-full bg-red-500 flex items-center ml-2 justify-center">
              {unreadBadgeLabel}
            </span>
          )}
        </p>

        <Link
          href="/notifications"
          className={`text-lg font-medium w-fit min-w-3/11 hover:underline ${
            isDriver
              ? "text-gray-300 hover:text-gray-500"
              : "text-blue-300 hover:text-blue-500"
          }`}
        >
          {isFR ? "Voir tous" : "See all"} {">"}
        </Link>
      </div>

      {/* ─── Séparateur ─────────────────────────────────────────────────── */}
      <div
        className={`w-full h-1 rounded-full mb-4 ${
          isDriver ? "bg-[#f8f8f8]" : "bg-[#08316e]"
        }`}
      />

      {/* ─── Liste ou état vide ──────────────────────────────────────────── */}
      {rawNotifications.length === 0 ? (
        <div className="w-full h-50 flex justify-center items-center">
          <p
            className={`text-2xl text-center ${
              isDriver ? "text-white" : "text-gray-700"
            }`}
          >
            {isFR
              ? "Aucune notification pour le moment."
              : "No notifications at the moment."}
          </p>
        </div>
      ) : (
        <div
          className={`w-full overflow-y-auto gap-y-2 flex flex-col ${
            isDriver ? "px-2 max-h-[calc(6*100px)]" : "px-4 max-h-[calc(4*100px)]"
          }`}
          style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
        >
          {displayedNotifications.map((notification) => {
            const urgent = isImportant(notification.type);
            return (
              <div
                key={notification.id}
                className={`w-full h-fit border-4 rounded-lg shadow-sm cursor-pointer
                  hover:shadow-md hover:shadow-blue-500/30 hover:scale-105 active:scale-95
                  transition-all duration-300
                  ${urgent
                    ? "bg-red-100 border-red-500"
                    : `bg-gray-100 ${isDriver ? "border-blue-400" : "border-[#08316e]"}`
                  }`}
                onClick={() => {
                  const uid  = appState.userConnected?.id;
                  if (!uid) return;
                  const role = appState.userConnected?.role?.toString().toLowerCase() ?? 'passenger';
                  router.push(
                    `/${role}/notifications/${uid}?notificationid=${notification.id}`
                  );
                }}
              >
                <div
                  className={`flex w-full h-full items-center justify-between p-2 ${
                    urgent ? "wave-pulse animate-pulse" : ""
                  }`}
                >
                  <NotificationIcon type={notification.type} />

                  <div className="flex justify-between items-center w-full">
                    <div className="flex flex-col text-black">
                      <div className="flex items-center gap-2">
                        <NotificationTitle type={notification.type} lang={appState.lang} />
                        {/* Point bleu non-lu */}
                        {!notification.isRead && (
                          <div className="w-3 h-3 rounded-full bg-[#08316e]" />
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(notification.date, appState.lang)}
                      </span>
                      <p className="text-sm truncate max-w-40 text-gray-700">
                        {notification.message}
                      </p>
                    </div>
                    <span className="text-sm text-gray-700">{notification.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Séparateur bas ─────────────────────────────────────────────── */}
      <div
        className={`w-full h-1 rounded-full mt-4 ${
          isDriver ? "bg-[#f8f8f8]" : "bg-[#08316e]"
        }`}
      />
    </section>
  );
}

// ─── Sous-composants visuels ─────────────────────────────────────────────────

/**
 * Retourne l'icône correspondant au type de notification.
 * Utilise les assets PNG locaux pour les types standards, react-icons pour les autres.
 */
function NotificationIcon({ type }: { type: NotificationType }) {
  const iconProps = { width: 80, height: 60 };

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
      return <FaStar className="text-[#08316e] text-3xl" />;
    case NotificationType.AlerteTrajet:
      return <FaBell className="text-[#08316e] text-3xl" />;
    default:
      return <FaMessage className="text-[#08316e] text-3xl" />;
  }
}

/**
 * Retourne le titre localisé correspondant au type de notification.
 * Les types urgents (Annulation, UrgentRappel, Retard) affichent "!!!" en rouge.
 */
function NotificationTitle({
  type,
  lang,
}: {
  type: NotificationType;
  lang: Language;
}) {
  const isFR = lang === Language.FR;

  switch (type) {
    case NotificationType.Confirmation:
      return <span className="text-black font-bold text-xl">{isFR ? "Confirmation" : "Confirmation"}</span>;
    case NotificationType.UrgentRappel:
      return (
        <span className="text-black font-bold text-xl">
          {isFR ? "Rappel Urgent" : "Urgent Reminder"}
          <span className="text-red-500 ml-2">!!!</span>
        </span>
      );
    case NotificationType.Annulation:
      return (
        <span className="text-black font-bold text-xl">
          {isFR ? "Annulation" : "Cancellation"}
          <span className="text-red-500 ml-2">!!!</span>
        </span>
      );
    case NotificationType.Retard:
      return <span className="text-red-500 font-bold text-xl">{isFR ? "Retard" : "Delay"} !!!</span>;
    case NotificationType.Infos:
      return <span className="text-black font-bold text-xl">{isFR ? "Information" : "Information"}</span>;
    case NotificationType.Rappel:
      return <span className="text-black font-bold text-xl">{isFR ? "Rappel" : "Reminder"}</span>;
    case NotificationType.NouvelleAvis:
      return <span className="text-black font-bold text-xl">{isFR ? "Nouvel Avis" : "New Review"}</span>;
    case NotificationType.AlerteTrajet:
      return <span className="text-[#08316e] font-bold text-xl">{isFR ? "Alerte Trajet" : "Trip Alert"}</span>;
    default:
      return <span className="text-black font-bold text-xl">{isFR ? "Notification" : "Notification"}</span>;
  }
}
