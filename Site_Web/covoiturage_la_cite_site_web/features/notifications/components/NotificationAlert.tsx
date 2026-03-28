"use client";

/**
 * NotificationAlert — Alerte push en temps réel (queue)
 *
 * - Toutes les notifications défilent automatiquement (durée variable par type)
 * - Clic sur le corps → navigation vers la page de notifications de l'utilisateur
 * - Bouton ✕ → passe immédiatement à la suivante (ou ferme si dernière)
 * - Couleur par sémantique de type : vert (positif), bleu (info), orange (refus), rouge (urgent)
 */

import { useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaBell,
  FaStar,
  FaTriangleExclamation,
  FaCircleCheck,
  FaCircleXmark,
  FaCalendarDays,
  FaShield,
  FaXmark,
  FaArrowRight,
  FaChevronRight,
} from "react-icons/fa6";
import type { NotificationModel, NotificationType } from "@/core/models/NotificationModel";
import { useRouter } from "next/navigation";

// ─── Durée d'affichage par type ───────────────────────────────────────────────

function getDelay(type: NotificationType): number {
  switch (type) {
    case "security_alert":
    case "cancellation_penalty":
      return 12000;
    case "reservation_received":
    case "trip_starting_soon":
    case "trip_cancelled":
      return 8000;
    default:
      return 5000;
  }
}

// ─── Thème couleur par sémantique ─────────────────────────────────────────────

interface Theme {
  bg: string;
  border: string;
  title: string;
  msg: string;
  meta: string;
  close: string;
  progress: string;
  icon: string;
}

function getTheme(type: NotificationType): Theme {
  switch (type) {
    // Vert — événements positifs
    case "reservation_accepted":
    case "trip_created":
    case "trip_completed":
      return {
        bg: "bg-green-50",
        border: "border-green-200",
        title: "text-green-800 font-bold",
        msg: "text-green-700",
        meta: "text-green-600/80",
        close: "text-green-400 hover:text-green-700",
        progress: "bg-green-500/40",
        icon: "text-green-600",
      };

    // Bleu — informationnel / action attendue
    case "reservation_received":
    case "reservation_sent":
    case "trip_starting_soon":
    case "trip_started":
      return {
        bg: "bg-blue-50",
        border: "border-blue-200",
        title: "text-blue-800 font-bold",
        msg: "text-blue-700",
        meta: "text-blue-600/80",
        close: "text-blue-400 hover:text-blue-700",
        progress: "bg-blue-500/40",
        icon: "text-blue-600",
      };

    // Orange — refus ou annulation
    case "reservation_refused":
    case "reservation_cancelled":
    case "trip_cancelled":
      return {
        bg: "bg-amber-50",
        border: "border-amber-200",
        title: "text-amber-800 font-bold",
        msg: "text-amber-700",
        meta: "text-amber-600/80",
        close: "text-amber-400 hover:text-amber-700",
        progress: "bg-amber-500/40",
        icon: "text-amber-600",
      };

    // Rouge — problèmes sérieux
    case "security_alert":
    case "cancellation_penalty":
      return {
        bg: "bg-red-50",
        border: "border-red-300",
        title: "text-red-800 font-bold",
        msg: "text-red-700",
        meta: "text-red-600/80",
        close: "text-red-400 hover:text-red-700",
        progress: "bg-red-500/40",
        icon: "text-red-600",
      };

    // Jaune — avis
    case "new_review_received":
      return {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        title: "text-yellow-800 font-bold",
        msg: "text-yellow-700",
        meta: "text-yellow-600/80",
        close: "text-yellow-500 hover:text-yellow-800",
        progress: "bg-yellow-500/40",
        icon: "text-yellow-500",
      };

    // Gris — système / neutre
    default:
      return {
        bg: "bg-white",
        border: "border-[#08316e]/20",
        title: "text-[#08316e] font-bold",
        msg: "text-gray-600",
        meta: "text-[#08316e]/60",
        close: "text-gray-400 hover:text-gray-700",
        progress: "bg-[#08316e]/30",
        icon: "text-[#08316e]",
      };
  }
}

// ─── Icône par type ───────────────────────────────────────────────────────────

function NotifIcon({ type, iconCl }: { type: NotificationType; iconCl: string }) {
  const img = (src: string, alt: string) => (
    <Image src={src} alt={alt} width={24} height={24} className="shrink-0" />
  );

  switch (type) {
    case "reservation_received":
      return img("/assets/notification-icons/info.png", "Nouvelle demande");
    case "reservation_sent":
    case "reservation_accepted":
    case "trip_created":
    case "trip_completed":
      return <FaCircleCheck size={20} className={`shrink-0 ${iconCl}`} />;
    case "reservation_refused":
    case "reservation_cancelled":
    case "trip_cancelled":
      return <FaCircleXmark size={20} className={`shrink-0 ${iconCl}`} />;
    case "trip_starting_soon":
    case "trip_started":
      return <FaCalendarDays size={18} className={`shrink-0 ${iconCl}`} />;
    case "new_review_received":
      return <FaStar size={18} className={`shrink-0 ${iconCl}`} />;
    case "cancellation_penalty":
      return <FaTriangleExclamation size={18} className={`shrink-0 ${iconCl}`} />;
    case "security_alert":
      return <FaShield size={18} className={`shrink-0 ${iconCl}`} />;
    default:
      return <FaBell size={18} className={`shrink-0 ${iconCl}`} />;
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface NotificationAlertProps {
  notification: NotificationModel | null;
  isVisible: boolean;
  /** Nombre total d'éléments dans la queue (incluant current) */
  queueLength: number;
  onDismiss: () => void;
  /** URL de la page de notifications de l'utilisateur (clic sur le corps) */
  notificationsHref?: string;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export function NotificationAlert({
  notification,
  isVisible,
  queueLength,
  onDismiss,
  notificationsHref,
}: NotificationAlertProps) {
  const router   = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const delay = notification ? getDelay(notification.type) : 5000;
  const theme = notification ? getTheme(notification.type) : getTheme("system");

  // Auto-fermeture — tous les types, durée variable
  useEffect(() => {
    if (!isVisible || !notification) return;
    timerRef.current = setTimeout(onDismiss, delay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isVisible, onDismiss, notification?.id, delay]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleBodyClick() {
    onDismiss();
    const href = notificationsHref ?? notification?.link;
    if (href) router.push(href);
  }

  const queueRemaining = queueLength - 1;

  return (
    <AnimatePresence>
      {isVisible && notification && (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, y: -70, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -60, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-15 left-4/9 z-9999 w-[calc(100%-2rem)] max-w-sm"
          style={{ transform: "translateX(-50%)" }}
        >
          <div
            className={`${theme.bg} ${theme.border} rounded-2xl shadow-2xl border overflow-hidden cursor-pointer`}
            onClick={handleBodyClick}
          >
            {/* Barre de progression (toujours présente) */}
            <motion.div
              key={`progress-${notification.id}`}
              className={`h-1 ${theme.progress} origin-left`}
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: delay / 1000, ease: "linear" }}
            />

            {/* Indicateur de queue */}
            {queueLength > 1 && (
              <div className={`flex items-center justify-between px-4 pt-2 pb-0 ${theme.meta}`}>
                <span className="text-[10px] font-semibold uppercase tracking-wide">
                  {queueLength} notification{queueLength > 1 ? "s" : ""} en attente
                </span>
                {queueRemaining > 0 && (
                  <span className="text-[10px] flex items-center gap-0.5">
                    {queueRemaining} suivante{queueRemaining > 1 ? "s" : ""}
                    <FaChevronRight size={8} />
                  </span>
                )}
              </div>
            )}

            {/* Contenu */}
            <div className="flex items-start gap-3 px-4 py-3">
              {/* Icône */}
              <div className="mt-0.5 rounded-xl p-1.5 bg-black/5">
                <NotifIcon type={notification.type} iconCl={theme.icon} />
              </div>

              {/* Texte */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-tight truncate ${theme.title}`}>
                  {notification.title}
                </p>
                <p className={`text-xs mt-0.5 line-clamp-2 ${theme.msg}`}>
                  {notification.message}
                </p>

                {/* Détails trajet */}
                {notification.tripDetails && (
                  <p className={`text-[11px] mt-1 flex items-center gap-1 ${theme.meta}`}>
                    <span className="truncate max-w-[80px]">{notification.tripDetails.departure}</span>
                    <FaArrowRight size={8} />
                    <span className="truncate max-w-[80px]">{notification.tripDetails.arrival}</span>
                    <span className="ml-1 font-semibold">{notification.tripDetails.time}</span>
                  </p>
                )}
              </div>

              {/* Bouton fermer / passer à la suivante */}
              <button
                onClick={(e) => { e.stopPropagation(); onDismiss(); }}
                className={`shrink-0 mt-0.5 transition-colors ${theme.close}`}
                aria-label={queueRemaining > 0 ? "Notification suivante" : "Fermer"}
              >
                {queueRemaining > 0
                  ? <FaChevronRight size={14} />
                  : <FaXmark size={14} />
                }
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
