/**
 * @file useNotifications.ts
 * @description Hook gérant la logique des notifications du dashboard.
 * Extrait de notifications.section.tsx pour séparer logique et présentation.
 *
 * Responsabilités :
 * - Calcul du nombre de notifications non lues
 * - Tri des notifications par date/heure décroissante
 * - Détermination de l'urgence d'une notification
 * - Formatage du badge compteur (99+)
 * - Calcul du nombre de notifications à afficher (1/3 de la liste, min 6)
 *
 * @param notifications Liste brute des notifications à traiter
 * @returns {UseNotificationsReturn} Données dérivées prêtes à l'affichage
 */

import { useMemo } from "react";
import {
  Notification,
  NotificationType,
  IMPORTANT_NOTIFICATION_TYPES,
  NOTIFICATION_COUNT_MAX_DISPLAY,
} from "../types/notification.types";

// ─── Types du hook ───────────────────────────────────────────────────────────

interface UseNotificationsReturn {
  /** Nombre de notifications avec isRead === false */
  unreadCount: number;
  /** Badge affiché : nombre exact ou "99+" si dépassement */
  unreadBadgeLabel: string;
  /** Notifications triées par date/heure décroissante, tronquées pour l'affichage */
  displayedNotifications: Notification[];
  /**
   * Retourne true si la notification est urgente (UrgentRappel ou Retard).
   * Déclenche le style rouge + animation pulse.
   */
  isImportant: (type: NotificationType) => boolean;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useNotifications(notifications: Notification[]): UseNotificationsReturn {
  // Toutes les valeurs sont mémoïsées : recalcul uniquement si la liste change
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const unreadBadgeLabel = useMemo(
    () => (unreadCount > NOTIFICATION_COUNT_MAX_DISPLAY ? "99+" : unreadCount.toString()),
    [unreadCount]
  );

  /**
   * Trie les notifications du plus récent au plus ancien.
   * Puis tronque à max(length / 3, 6) pour le widget dashboard (aperçu limité).
   * La page /notifications complète affiche la liste entière.
   */
  const displayedNotifications = useMemo(() => {
    const sorted = [...notifications].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`).getTime();
      const dateB = new Date(`${b.date}T${b.time}`).getTime();
      return dateB - dateA;
    });
    const displayLimit = Math.max(Math.floor(notifications.length / 3), 6);
    return sorted.slice(0, displayLimit);
  }, [notifications]);

  /**
   * Vérifie si un type de notification déclenche le style urgent.
   * Centralisé ici pour éviter la duplication entre le composant et les styles.
   */
  const isImportant = (type: NotificationType): boolean =>
    IMPORTANT_NOTIFICATION_TYPES.includes(type);

  return {
    unreadCount,
    unreadBadgeLabel,
    displayedNotifications,
    isImportant,
  };
}
